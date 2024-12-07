export const SCRIPT_SRC = [
  "'self'",
  "'unsafe-eval'",
  "'unsafe-inline'",
  'https://va.vercel-scripts.com',
  'https://vercel.live',
  'https://*.vercel.app',
  'https://www.google.com',
  'https://www.gstatic.com',
  'https://*.google.com',
  'https://www.paypal.com',
  'https://www.paypalobjects.com',
  `${process.env.HOSTNAME === 'localhost' ? 'http://localhost:3024' : ''}`,
];
