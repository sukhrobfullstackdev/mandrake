import { useStore } from '@hooks/store';
import localforage from 'localforage';
import { data as WebStorageDataAPI } from '../data-api';
jest.mock('localforage-driver-memory');
jest.mock('@hooks/store', () => ({
  useStore: { getState: jest.fn() },
}));

jest.mock('localforage', () => ({
  createInstance: jest.fn().mockReturnValue({
    defineDriver: jest.fn().mockResolvedValue(undefined),
    setDriver: jest.fn().mockResolvedValue(undefined),
    ready: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue('mocked value'),
  }),
}));

describe('WebStorageDataAPI', () => {
  const getItemMock = jest.fn();
  const setItemMock = jest.fn();
  const removeItemMock = jest.fn();
  const setDriverMock = jest.fn();
  const clearMock = jest.fn();
  const lengthMock = jest.fn().mockReturnValue(2);

  beforeEach(() => {
    jest.clearAllMocks();

    (localforage.createInstance as jest.Mock).mockReturnValue({
      defineDriver: jest.fn(),
      setDriver: setDriverMock,
      ready: jest.fn().mockResolvedValue(undefined),
      getItem: getItemMock.mockResolvedValue('mocked value'),
      setItem: setItemMock,
      removeItem: removeItemMock,
      clear: clearMock,
      length: lengthMock,
    });

    (useStore.getState as jest.Mock).mockReturnValue({
      decodedQueryParams: {
        sdkType: 'magic-sdk-flutter',
      },
    });
  });

  it('should lazily initialize localforage and call getItem correctly', async () => {
    const result = await WebStorageDataAPI.getItem('someKey');

    expect(localforage.createInstance).toHaveBeenCalledWith({ name: 'magic_auth' });
    expect((localforage.createInstance as jest.Mock)().setDriver).toHaveBeenCalled();
    expect((localforage.createInstance as jest.Mock)().getItem).toHaveBeenCalledWith('someKey');
    expect(result).toBe('mocked value');
  });

  it('should lazily initialize localforage and call setItem correctly', async () => {
    await WebStorageDataAPI.setItem('someKey', 'someValue');
    expect((localforage.createInstance as jest.Mock)().setItem).toHaveBeenCalledWith('someKey', 'someValue');
  });

  it('should lazily initialize localforage and call remove correctly', async () => {
    await WebStorageDataAPI.removeItem('someKey');
    expect((localforage.createInstance as jest.Mock)().removeItem).toHaveBeenCalledWith('someKey');
  });

  it('should lazily initialize localforage and call clear correctly', async () => {
    await WebStorageDataAPI.clear();
    expect((localforage.createInstance as jest.Mock)().clear).toHaveBeenCalled();
  });

  it('should lazily initialize localforage and call length correctly', async () => {
    const result = await WebStorageDataAPI.length();
    expect((localforage.createInstance as jest.Mock)().length).toHaveBeenCalled();
    expect(result).toBe(2);
  });
});
