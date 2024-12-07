/* istanbul ignore file */
'use client';

import { useApiWalletRouteNextPendingRpcRequest } from '@hooks/common/route-next-pending-rpc-request';
import { useEffect } from 'react';

export default function Idle() {
  const routeNextPendingRpcRequest = useApiWalletRouteNextPendingRpcRequest();
  useEffect(() => {
    routeNextPendingRpcRequest();
  }, []);
  return <div></div>;
}
