'use client';

import { useServerRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { ServerRpcError } from '@lib/common/custom-errors';

interface Props {
  error: ServerRpcError;
}

export default function Error({ error }: Props) {
  useServerRejectActiveRpcRequest(error);
  return null;
}
