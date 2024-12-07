'use client';

import { LoginProvider } from '@app/send/login-context';
import { getQueryClient } from '@common/query-client';
import PageFooter from '@components/show-ui/footer';
import { GOOGLE_RECAPTCHA_KEY } from '@constants/env';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import Script from 'next/script';
import React from 'react';
import SmsPageHeader from './__components__/sms-page-header';

export default function LoginWithSmsLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Script src={`https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_KEY}`} />
        <LoginProvider>
          <Page backgroundType="blurred">
            <SmsPageHeader />
            {children}
            <PageFooter />
          </Page>
        </LoginProvider>
      </HydrationBoundary>
    </>
  );
}
