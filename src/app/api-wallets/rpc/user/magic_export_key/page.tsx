/* istanbul ignore file */
'use client';

import AgreementPage from '@app/api-wallets/rpc/user/magic_export_key/agreement_view/page';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { IFrameMessageService } from '@lib/message-channel/iframe-api-wallets/iframe-message-service';
import { useEffect } from 'react';

export default function ExportPrivateKey() {
  const { isComplete: isHydrateSessionComplete } = useHydrateSession();

  useEffect(() => {
    if (!isHydrateSessionComplete) {
      return;
    }

    IFrameMessageService.showOverlay();
  }, [isHydrateSessionComplete]);

  return <AgreementPage />;
}
