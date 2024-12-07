import { useResetAuthState } from '@hooks/common/auth-state';
import { useUserLogoutQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';

export function useLogout() {
  const { authUserId } = useStore(state => state);
  const { resetAuthState } = useResetAuthState();
  const { mutate: mutateUserLogout } = useUserLogoutQuery();
  /**
   * Regardless of the logout API result, we want to clear the user's
   * session on the client side and redirect to the send page
   */
  const logout = async () => {
    mutateUserLogout({ authUserId: authUserId || '' });

    dispatchPhantomClearCacheKeys();
    await resetAuthState();
  };

  return {
    logout,
  };
}
