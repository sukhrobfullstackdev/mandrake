import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { act, renderHook } from '@testing-library/react';
import { useSendRouter } from '../send-router';

const mockReplace = jest.fn();
const mockStartPerformanceTimer = jest.spyOn(AtomicRpcPayloadService, 'startPerformanceTimer');

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('usePassportRouter', () => {
  beforeEach(() => {
    useStore.setState({
      decodedQueryParams: { locale: undefined }, // Default no locale
    });
    mockReplace.mockClear();
    mockStartPerformanceTimer.mockClear();
  });

  it('should replace new route without params and locale', () => {
    const { result } = renderHook(() => useSendRouter());
    act(() => {
      result.current.replace('/home');
    });
    expect(mockReplace).toHaveBeenCalledWith('/home');
    expect(mockStartPerformanceTimer).toHaveBeenCalledWith('/home');
  });

  it('should append locale to route when no parameters are present', () => {
    useStore.setState({
      decodedQueryParams: { locale: 'en-US' },
    });
    const { result } = renderHook(() => useSendRouter());
    act(() => {
      result.current.replace('/home');
    });
    expect(mockReplace).toHaveBeenCalledWith('/home?lang=en-US');
    expect(mockStartPerformanceTimer).toHaveBeenCalledWith('/home');
  });

  it('should replace new route with params but without locale', () => {
    const { result } = renderHook(() => useSendRouter());
    act(() => {
      result.current.replace('/home?query=123');
    });
    expect(mockReplace).toHaveBeenCalledWith('/home?query=123');
    expect(mockStartPerformanceTimer).toHaveBeenCalledWith('/home');
  });

  it('should replace new route with params and convert locale', () => {
    useStore.setState({
      decodedQueryParams: { locale: 'en-US' },
    });
    const { result } = renderHook(() => useSendRouter());
    act(() => {
      result.current.replace('/home?query=123');
    });
    expect(mockReplace).toHaveBeenCalledWith('/home?query=123&lang=en-US');
    expect(mockStartPerformanceTimer).toHaveBeenCalledWith('/home');
  });

  it('should replace new route with params and convert locale without adding more lang', () => {
    useStore.setState({
      decodedQueryParams: { locale: 'en-US' },
    });
    const { result } = renderHook(() => useSendRouter());
    act(() => {
      result.current.replace('/home?query=123&lang=en-US');
    });
    expect(mockReplace).toHaveBeenCalledWith('/home?query=123&lang=en-US');
    expect(mockStartPerformanceTimer).toHaveBeenCalledWith('/home');
  });
});
