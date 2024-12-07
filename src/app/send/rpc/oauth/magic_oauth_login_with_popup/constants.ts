import { LEGACY_URL } from '@constants/env';

export const POPUP_BASE_URL = LEGACY_URL;
export const POPUP_VERIFY_PATH = '/oauth2/popup/verify';
export const POPUP_VERIFY_URL = `${global?.window ? window.location.origin : POPUP_BASE_URL}${POPUP_VERIFY_PATH}`;

export const RPC_VERIFY_ROUTE = '/send/rpc/oauth/magic_oauth_login_with_popup/verify';
