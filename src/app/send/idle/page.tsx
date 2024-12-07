/* istanbul ignore file */
'use client';

import { useRouteNextPendingRpcRequest } from '@hooks/common/route-next-pending-rpc-request';
import { useEffect } from 'react';

export default function Idle() {
  const routeNextPendingRpcRequest = useRouteNextPendingRpcRequest();
  useEffect(() => {
    routeNextPendingRpcRequest();
  }, []);
  return <div></div>;
}
