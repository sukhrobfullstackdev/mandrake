import { type SupportedOAuthProviders } from '@custom-types/oauth';
import { apple } from './apple';
import { bitbucket } from './bitbucket';
import { discord } from './discord';
import { facebook } from './facebook';
import { github } from './github';
import { gitlab } from './gitlab';
import { google } from './google';
import { linkedin } from './linkedin';
import { microsoft } from './microsoft';
import { twitch } from './twitch';
import { twitter } from './twitter';

export const oauthProviders: SupportedOAuthProviders = {
  apple,
  bitbucket,
  discord,
  facebook,
  github,
  gitlab,
  google,
  linkedin,
  twitter,
  twitch,
  microsoft,
};

export * as shared from './shared';
