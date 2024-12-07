import { useStore } from '@hooks/store';

export enum MobileSDKs {
  IOS = 'magic-sdk-ios',
  ANDROID = 'magic-sdk-android',
  FLUTTER = 'magic-sdk-flutter',
  RN = 'magic-sdk-rn',
  RN_BARE = 'magic-sdk-rn-bare',
  RN_EXPO = 'magic-sdk-rn-expo',
  UNITY = 'magic-sdk-unity',
}

export const mobileSDKs = [
  'magic-sdk-ios',
  'magic-sdk-android',
  'magic-sdk-flutter',
  'magic-sdk-rn',
  'magic-sdk-rn-bare',
  'magic-sdk-rn-expo',
  'magic-sdk-unity',
];

export function isMobileSdk(sdkType?: string, domainOrigin?: string) {
  const isMobileBoxRelayer = /(box\.(dev\.|stagef\.|)magic\.link)/.test(domainOrigin!);

  const isSDKMobile = mobileSDKs.includes(sdkType || '');

  return isSDKMobile || isMobileBoxRelayer;
}

export function useIsMobileSDK() {
  const { sdkType, domainOrigin } = useStore(state => state.decodedQueryParams);

  return isMobileSdk(sdkType, domainOrigin);
}

export function useIsIosSDK() {
  const { sdkType } = useStore(state => state.decodedQueryParams);
  return sdkType === MobileSDKs.IOS;
}

export function useIsRnSDK() {
  const { sdkType } = useStore(state => state.decodedQueryParams);

  return sdkType === MobileSDKs.RN || sdkType === MobileSDKs.RN_BARE || sdkType === MobileSDKs.RN_EXPO;
}

export function useIsRnOrIosSDK() {
  const isRn = useIsRnSDK();
  const isIos = useIsIosSDK();
  return isRn || isIos;
}

export function isAndroidDevice() {
  return navigator && navigator.userAgent.toLocaleLowerCase().includes('android');
}

export function isIosDevice() {
  return navigator && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

export function useIsAndroid() {
  return useIsMobileSDK() && navigator && navigator.userAgent.toLocaleLowerCase().includes('android');
}

export function isWindows() {
  return navigator.userAgent.toLowerCase().includes('win');
}

export function useIsAndroidSDK() {
  const { sdkType } = useStore(state => state.decodedQueryParams);

  return sdkType === MobileSDKs.ANDROID;
}

export function isMobileUserAgent() {
  return (
    navigator &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent.toLocaleLowerCase(),
    )
  );
}
