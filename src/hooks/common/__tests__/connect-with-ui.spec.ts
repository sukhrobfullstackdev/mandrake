import { renderHook } from '@testing-library/react';
import { useConnectWithUIMethod } from '../connect-with-ui';
import { useStore } from '@hooks/store';
import { useFlags } from '@hooks/common/launch-darkly';
import { ConnectWithUILoginMethod } from '@custom-types/connect-with-ui';
import { OAuthProvider } from '@custom-types/oauth';
import { RELAYER_LAST_LOGGED_IN_WITH_METHOD } from '@app/send/rpc/wallet/mc_login/constants';

jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn(),
}));

describe('useConnectWithUIMethod', () => {
  beforeEach(() => {
    localStorage.clear();
    (useFlags as jest.Mock).mockClear();
  });

  it('returns EMAIL as default login type when no stored value is found', () => {
    useStore.setState({ isGlobalAppScope: false });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: false } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.loginType).toBe(ConnectWithUILoginMethod.EMAIL);
  });

  it('returns GOOGLE as login type when social login is enabled and no stored value is found', () => {
    useStore.setState({ isGlobalAppScope: false });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: true } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.loginType).toBe(OAuthProvider.GOOGLE);
  });

  it('returns LEGACY_GOOGLE_SIGN_IN as login type when global app scope is true and no stored value is found', () => {
    useStore.setState({ isGlobalAppScope: true });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: false } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.loginType).toBe(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
  });

  it('returns stored value as login type when stored value is EMAIL', () => {
    localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, ConnectWithUILoginMethod.EMAIL);
    useStore.setState({ isGlobalAppScope: false });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: false } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.loginType).toBe(ConnectWithUILoginMethod.EMAIL);
  });

  it('returns stored value as login type when stored value is LEGACY_GOOGLE_SIGN_IN and global app scope is true', () => {
    localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
    useStore.setState({ isGlobalAppScope: true });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: false } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.loginType).toBe(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
    expect(result.current.lastLoggedInType).toBe(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
  });

  it('returns GOOGLE as login type when stored value is a social login and social login is enabled', () => {
    localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, OAuthProvider.GOOGLE);
    useStore.setState({ isGlobalAppScope: false });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: true } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.loginType).toBe(OAuthProvider.GOOGLE);
    expect(result.current.lastLoggedInType).toBe(OAuthProvider.GOOGLE);
  });

  it('returns UNKNOWN as last logged in type when no stored value is found', () => {
    useStore.setState({ isGlobalAppScope: false });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: false } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.lastLoggedInType).toBe(ConnectWithUILoginMethod.UNKNOWN);
  });

  it('returns stored value as last logged in type when stored value is EMAIL', () => {
    localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, ConnectWithUILoginMethod.EMAIL);
    useStore.setState({ isGlobalAppScope: false });
    (useFlags as jest.Mock).mockReturnValue({ socialWidgetsV2: { enabled: false } });

    const { result } = renderHook(() => useConnectWithUIMethod());
    expect(result.current.lastLoggedInType).toBe(ConnectWithUILoginMethod.EMAIL);
  });
});
