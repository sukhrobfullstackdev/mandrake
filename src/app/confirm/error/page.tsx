'use client';

import { useSearchParams } from 'next/navigation';
import { Page } from '@magiclabs/ui-components';
import LinkExpiredState from '@app/confirm/error/__components__/link-expired-state';
import InternalErrorState from '@app/confirm/error/__components__/internal-error-state';
import IpAddressMismatchState from '@app/confirm/error/__components__/ip-address-mismatch-state';
import SecurityCodeExpiredState from '@app/confirm/error/__components__/security-code-expired-state';
import InvalidRedirectUrl from '@app/confirm/error/__components__/invalid-redirect-url';
import LinkBrokenState from '@app/confirm/error/__components__/link-broken-state';
import { EmailLinkConfirmErrorState } from '@constants/email-link';

export default function EmailLinkConfirmError() {
  const searchParams = useSearchParams();

  const type = searchParams.get('errorType')?.toLowerCase() as EmailLinkConfirmErrorState;

  const renderErrorComponent = () => {
    switch (type) {
      case EmailLinkConfirmErrorState.LinkBroken:
        return <LinkBrokenState />;
      case EmailLinkConfirmErrorState.AuthExpired:
        return <LinkExpiredState />;
      case EmailLinkConfirmErrorState.RedirectFailed:
        return <InvalidRedirectUrl />;
      case EmailLinkConfirmErrorState.SecurityCodeExpired:
        return <SecurityCodeExpiredState />;
      case EmailLinkConfirmErrorState.MismatchedIP:
        return <IpAddressMismatchState />;
      case EmailLinkConfirmErrorState.InternalError:
      default:
        return <InternalErrorState />;
    }
  };

  return <Page.Content>{renderErrorComponent()}</Page.Content>;
}
