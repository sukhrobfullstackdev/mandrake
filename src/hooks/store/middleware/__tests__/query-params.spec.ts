import { StoreState, initialState } from '@hooks/store';
import { mockDecodedParams1, mockDecodedParams2, mockDecodedParams3 } from '@mocks/query-params';
import { create } from '@mocks/zustand';
import { queryParamMiddleware } from '../query-params';

const setup = (initStateOverride: Partial<StoreState> = {}) => {
  const mockState = (): StoreState => ({
    ...initialState,
    ...initStateOverride,
  });

  const mockUseStore = create<StoreState>()(queryParamMiddleware(mockState));
  return { mockUseStore };
};

describe('@hooks/store/middleware/query-params', () => {
  it('api key is default if no state set', () => {
    const { mockUseStore } = setup();
    expect(mockUseStore.getState().magicApiKey).toBeNull();
  });

  it('should set api key from encoded query params', () => {
    const { mockUseStore } = setup();
    mockUseStore.setState({ decodedQueryParams: mockDecodedParams1 });
    expect(mockUseStore.getState().magicApiKey).toBe('pk_live_981D9DF7A41E9F11');
  });

  it('should set different api key from encoded query params', () => {
    const { mockUseStore } = setup();
    mockUseStore.setState({ decodedQueryParams: mockDecodedParams2 });
    expect(mockUseStore.getState().magicApiKey).toBe('pk_live_12345');
  });

  it('api key should be null if not found within query params', () => {
    const { mockUseStore } = setup();
    mockUseStore.setState({ decodedQueryParams: mockDecodedParams3 });
    expect(mockUseStore.getState().magicApiKey).toBeNull();
  });

  it('api key remains the same if query params are the same', () => {
    const { mockUseStore } = setup({ decodedQueryParams: mockDecodedParams1, magicApiKey: 'pk_mock_5' });
    mockUseStore.setState({ decodedQueryParams: mockDecodedParams1 });
    expect(mockUseStore.getState().magicApiKey).toBe('pk_mock_5');
  });

  it('api key remains the same if query params is cleared', () => {
    const { mockUseStore } = setup({ magicApiKey: 'pk_mock_1' });
    mockUseStore.setState({ decodedQueryParams: undefined });
    expect(mockUseStore.getState().magicApiKey).toBe('pk_mock_1');
  });
});
