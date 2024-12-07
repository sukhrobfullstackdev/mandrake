/** This is a Next.js designated file (experimental) that is run during server start-up.
 * For more information see: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({ serviceName: 'mandrake' });
  // server startup message
  console.info('\n 🎩 \x1b[95mMandrake server has started successfully! 🎩');
  console.info(
    ' \x1b[94m   - DEPLOY_ENV: ' +
      process.env.DEPLOY_ENV +
      '\n' +
      '    - HOSTNAME: ' +
      process.env.HOSTNAME +
      '\n' +
      '    - PORT: ' +
      process.env.PORT +
      '\n' +
      '    - VERCEL_ENV: ' +
      (process.env.VERCEL_ENV || 'n/a') +
      '\n\n',
  );
}
