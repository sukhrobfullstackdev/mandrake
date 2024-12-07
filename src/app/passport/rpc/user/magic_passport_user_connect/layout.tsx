'use client';

import Menu from '@app/passport/rpc/user/components/header/menu';
import { PassportPage } from '@magiclabs/ui-components';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MagicPassportConnectLayout({ children }: { children: JSX.Element }) {
  const [isAuthorizeDappRoute, setIsAuthorizeDappRoute] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAuthorizeDappRoute(pathname.endsWith('authorize_dapp'));
  }, [pathname]);

  return (
    <PassportPage>
      <PassportPage.Title branding="light" />
      {isAuthorizeDappRoute && (
        <PassportPage.Menu>
          <Menu />
        </PassportPage.Menu>
      )}
      {children}
    </PassportPage>
  );
}
