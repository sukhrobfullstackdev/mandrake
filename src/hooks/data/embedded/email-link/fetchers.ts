import { EmailLink } from '@constants/endpoint';
import { EmailLinkPollerQueryKey } from '@hooks/data/embedded/email-link/keys';
import { HttpService } from '@http-services';
import { signIframeUA } from '@lib/device-verification/ua-sig';
import { QueryFunction } from '@tanstack/react-query';
import { createJwtWithIframeKP, setDpopHeader } from '@utils/dpop';

export type EmailLinkStatusResponse = { authUserId: string; authUserSessionToken: string; refreshToken?: string };

export const emailLinkStatusFetch =
  (): QueryFunction<EmailLinkStatusResponse, EmailLinkPollerQueryKey> =>
  async ({ queryKey: [, { email, requestOriginMessage, jwt, loginFlowContext }] }) => {
    const body = {
      email,
      rom: requestOriginMessage,
      login_flow_context: loginFlowContext,
    };

    const headers = {
      ...setDpopHeader(await createJwtWithIframeKP(jwt)),
      'ua-sig': await signIframeUA(),
    };

    return HttpService.Magic.Post(EmailLink.Status, headers, body);
  };
