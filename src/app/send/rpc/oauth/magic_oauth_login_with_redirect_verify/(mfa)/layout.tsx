'use client';

import PageFooter from '@components/show-ui/footer';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function OAuthV1MfaLayout({ children }: Props) {
  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  return (
    <Page backgroundType="blurred">
      {children}
      <PageFooter />
    </Page>
  );
}
