import { OAUTH_THEME_COOKIE } from '@constants/cookies';
import { ClientTheme } from '@custom-types/magic-client';
import { parseCookie } from '@lib/utils/cookies';
import { cookies } from 'next/headers';
import { getServerPathname } from './headers';

export interface InitializeThemeReturn {
  'data-color-mode'?: string | null;
  style?: Record<string, unknown>;
}

//Initial server-side implimentation of setting theme to root layout
// TODO: Implement global theme support outside of OAuth
export const initializeTheme = (): InitializeThemeReturn => {
  const themeCookie = cookies().get(OAUTH_THEME_COOKIE)?.value;
  const theme = themeCookie ? parseCookie<ClientTheme>(themeCookie) : null;

  const pathname = getServerPathname() || '';

  // default theme to dark mode for passport
  if (!pathname) {
    return {
      'data-color-mode': 'dark',
      style: {
        backgroundColor: '#19191A',
        background: '#19191A',
      },
    };
  }

  // only set custom theme for OAuth credential create route
  if (!pathname.includes('/v1/oauth2/credential/create')) {
    return {};
  }

  let style = {};

  // set brand color from client theme
  if (theme?.buttonColor) {
    style = {
      ...style,
      '--brand-base': theme.buttonColor,
    };
  }

  return {
    'data-color-mode': theme?.themeColor || 'auto',
    style,
  };
};
