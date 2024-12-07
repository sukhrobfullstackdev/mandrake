'use client';

import { PopupMessageMethod } from '@custom-types/popup';
import { postPopupMessage } from '@lib/common/popup';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyLoginResultPage() {
  const searchParams = useSearchParams();
  const authorizationResponseParams = searchParams.toString();

  useEffect(() => {
    postPopupMessage({
      method: PopupMessageMethod.MAGIC_POPUP_OAUTH_VERIFY_RESPONSE,
      payload: { authorizationResponseParams },
    });

    window.close();
  }, []);

  return null;
}
