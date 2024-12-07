import { useLoginContext } from '@app/send/login-context';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useSearchParams } from 'next/navigation';

export const useEmailFromPayloadOrSearchParams = () => {
  const loginContext = useLoginContext();
  const searchParams = useSearchParams();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  if (activeRpcPayload?.params?.[0]?.email) {
    return activeRpcPayload?.params?.[0]?.email as string;
  } else if (searchParams.get('email')) {
    return decodeURIComponent(searchParams.get('email') as string);
  }
  return loginContext.emailFromPayload as string;
};
