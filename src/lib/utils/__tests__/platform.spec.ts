import { StoreState, initialState, useStore } from '@hooks/store';
import { renderHook } from '@testing-library/react';
import {
  isAndroidDevice,
  isIosDevice,
  isMobileUserAgent,
  isWindows,
  useIsAndroid,
  useIsAndroidSDK,
  useIsIosSDK,
  useIsMobileSDK,
  useIsRnOrIosSDK,
  useIsRnSDK,
} from '@utils/platform';

describe('isAndroid', () => {
  it('should return false when userAgent is not Android', () => {
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('iPhone');
    expect(isAndroidDevice()).toEqual(false);
  });
  it('should return true for all types of iOS devices', () => {
    ['iPhone', 'iPad', 'iPod'].forEach(device => {
      jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue(device);
      expect(isIosDevice()).toEqual(true);
    });
  });
});

describe('useIsIosSDK', () => {
  const setup = (state: Partial<StoreState>) => {
    useStore.setState({ ...initialState, ...state });
  };
  it('should return true when sdkType is ios', () => {
    setup({ decodedQueryParams: { sdkType: 'magic-sdk-ios' } });

    const { result } = renderHook(() => useIsIosSDK());
    expect(result.current).toEqual(true);
  });

  it('should return false when sdkType is android', () => {
    setup({ decodedQueryParams: { sdkType: 'magic-sdk-android' } });

    const { result } = renderHook(() => useIsIosSDK());
    expect(result.current).toEqual(false);
  });
});

describe('useIsRnSDK', () => {
  it('should return true when sdkType is rn', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-rn' } });
    const { result } = renderHook(() => useIsRnSDK());
    expect(result.current).toEqual(true);
  });
  it('should return false when sdkType is flutter', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-flutter' } });
    const { result } = renderHook(() => useIsRnSDK());
    expect(result.current).toEqual(false);
  });
});

describe('useIsRnOrIosSDK', () => {
  it('should return true when sdkType is rn', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-rn' } });
    const { result } = renderHook(() => useIsRnOrIosSDK());
    expect(result.current).toEqual(true);
  });
  it('should return true when sdkType is ios', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-ios' } });
    const { result } = renderHook(() => useIsRnOrIosSDK());
    expect(result.current).toEqual(true);
  });
  it('should return false when sdkType is unity', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-unity' } });
    const { result } = renderHook(() => useIsRnOrIosSDK());
    expect(result.current).toEqual(false);
  });
});

describe('useIsAndroidSDK', () => {
  it('should return true when sdkType is android', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-android' } });
    const { result } = renderHook(() => useIsAndroidSDK());
    expect(result.current).toEqual(true);
  });
  it('should return false when sdkType is ios', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-ios' } });
    const { result } = renderHook(() => useIsAndroidSDK());
    expect(result.current).toEqual(false);
  });
});

describe('useIsAndroid', () => {
  it('should return true when sdkType is android', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-android' } });
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('android');
    const { result } = renderHook(() => useIsAndroid());
    expect(result.current).toEqual(true);
  });
  it('should return false when sdkType is ios', () => {
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('iPhone');
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-ios' } });
    const { result } = renderHook(() => useIsAndroid());
    expect(result.current).toEqual(false);
  });
});

describe('useIsMobileSDK', () => {
  it('should return true when sdkType is android', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-android' } });
    const { result } = renderHook(() => useIsMobileSDK());
    expect(result.current).toEqual(true);
  });
  it('should return true when sdkType is ios', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: 'magic-sdk-ios' } });
    const { result } = renderHook(() => useIsMobileSDK());
    expect(result.current).toEqual(true);
  });
  it('should return false when sdkType is an empty string', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { sdkType: '' } });
    const { result } = renderHook(() => useIsMobileSDK());
    expect(result.current).toEqual(false);
  });
  it('should return false when sdkType is neither android nor ios', () => {
    useStore.setState({ ...initialState, decodedQueryParams: { domainOrigin: 'box.magic.link' } });
    const { result } = renderHook(() => useIsMobileSDK());
    expect(result.current).toEqual(true);
  });
});

describe('isWindows', () => {
  it('should return true when sdkType is android', () => {
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('win');
    const { result } = renderHook(() => isWindows());
    expect(result.current).toEqual(true);
  });
  it('should return false when sdkType is ios', () => {
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('linux');
    const { result } = renderHook(() => isWindows());
    expect(result.current).toEqual(false);
  });
});

describe('isMobileUserAgent', () => {
  it('should return true when userAgent is mobile', () => {
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('blackberry');
    const { result } = renderHook(() => isMobileUserAgent());
    expect(result.current).toEqual(true);
  });
  it('should return false when userAgent is not mobile', () => {
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue('blueberry');
    const { result } = renderHook(() => isMobileUserAgent());
    expect(result.current).toEqual(false);
  });
});
