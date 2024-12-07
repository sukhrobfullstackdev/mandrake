import { usePathname } from 'next/navigation';
import { useSendRouter } from '@hooks/common/send-router';

export const useDeviceVerificationRedirect = () => {
  const pathname = usePathname();
  const router = useSendRouter();
  const newPath = pathname.split('/').slice(0, -1).join('/') || '/';

  const redirectBackToAuthFlow = () => {
    router.replace(newPath);
  };
  return {
    redirectBackToAuthFlow,
  };
};
