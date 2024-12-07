'use client';

import { useIsLoggedIn } from '@hooks/common/is-logged-in';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect } from 'react';

export default function IsLoggedInPage() {
  useEffect(() => AtomicRpcPayloadService.handleVersionSkew(), []);

  useIsLoggedIn();

  return null;
}
