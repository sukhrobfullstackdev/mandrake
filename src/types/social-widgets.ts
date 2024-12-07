import { OAuthVerifyResponse } from '@hooks/data/embedded/oauth';

export interface SocialWidgetPopupResponse {
  verifyData: OAuthVerifyResponse;
  requestOriginMessage: string;
  errorCode?: string;
  error?: string;
}
