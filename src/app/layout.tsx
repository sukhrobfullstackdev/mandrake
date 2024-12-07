/* istanbul ignore file */

import QueryProvider from '@components/query-provider';
import Support from '@components/support';
import { initializeTheme } from '@lib/server/theme';
import { serverLogger } from '@lib/services/server-logger';
import type { Metadata } from 'next';
import { PublicEnvScript } from 'next-runtime-env';
import { inter } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Magic',
  description: 'Magic',
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  if (!globalThis.logger) {
    globalThis.logger = serverLogger;
  }

  return (
    <html lang="en" {...initializeTheme()}>
      <head>
        <PublicEnvScript />
        {/* Requested By IMX (PDEEXP-719). Use preconnect to optimize TLS handshakes for users far from the resource region.
     To avoid performance issues, limit the number of URLs preconnected.
     For additional server addresses, consider implementing a LaunchDarkly flag. */}
        <link rel="preconnect" href="https://kms.us-west-2.amazonaws.com" />
        <link rel="preconnect" href="https://api.magic.link" />
      </head>
      <Support />
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
