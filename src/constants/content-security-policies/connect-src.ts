export const CONNECT_SRC = [
  /* Magic */
  "'self'",
  "'unsafe-inline'",
  'https://*.magic.link',
  `${(process.env.GET_CREDENTIALS_PROXY_URL || '').replace(/\/$/, '')}`,

  /* Services */
  'https://vercel.live',
  'https://cognito.us-west-2.amazonaws.com',
  'https://kms.us-west-2.amazonaws.com',
  'https://cognito-identity.us-west-2.amazonaws.com',
  'https://*.hightouch-events.com/',
  'https://browser-intake-datadoghq.com',
  'https://*.launchdarkly.com',
  'https://*.google.com',
  'https://*.alchemy.com',
  'https://*.infura.io',
  'https://relay.farcaster.xyz',
  'https://*.alchemyapi.io/',
  `${process.env.HOSTNAME === 'localhost' ? 'http://localhost:8080 http://localhost:3000 http://127.0.0.1:3000' : ''}`,
];
