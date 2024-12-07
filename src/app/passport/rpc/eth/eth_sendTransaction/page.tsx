/* istanbul ignore file */
'use client';

import TransactionHeader from '@app/passport/rpc/eth/(components)/transaction-header';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { PassportPage, Text } from '@magiclabs/ui-components';
import type { JsonRpcRequestPayload } from 'magic-passport/types';
import { useEffect, useState } from 'react';

export default function SendTransaction() {
  const [payload, setPayload] = useState<null | JsonRpcRequestPayload>(null);

  useEffect(() => {
    try {
      const popupPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
      setPayload(popupPayload);
    } catch {
      logger.warn('No active RPC payload');
    }
  }, []);

  useEffect(() => {
    logger.log(payload);
  }, [payload]);

  return (
    <PassportPage>
      <TransactionHeader />
      <PassportPage.Content>
        <Text>Send transaction params: {payload?.params?.toString()}</Text>
      </PassportPage.Content>
    </PassportPage>
  );
}
