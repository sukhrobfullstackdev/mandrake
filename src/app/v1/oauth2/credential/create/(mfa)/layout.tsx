'use client';

import PageFooter from '@components/show-ui/footer';
import { Page } from '@magiclabs/ui-components';

interface Props {
  children: React.ReactNode;
}

export default function OAuthV1MfaLayout({ children }: Props) {
  return (
    <Page backgroundType="none">
      {children}
      <PageFooter />
    </Page>
  );
}
