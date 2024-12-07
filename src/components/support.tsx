'use client';

import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { getBasePassportAnalyticsProperties } from '@lib/message-channel/popup/popup-analytics-event-helper';
import { analytics } from '@lib/services/analytics';
import { getClientLogger } from '@lib/services/client-logger';
import { getMonitoring } from '@lib/services/monitoring';

import { usePassportStore } from '@hooks/data/passport/store';
import { useStore } from '@hooks/store';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
export default function Support() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { magicApiKey: dedicatedApiKey } = useStore.getState();
  const { magicApiKey: passportApiKey } = usePassportStore.getState();

  // on load
  useEffect(() => {
    globalThis.logger = getClientLogger();
    globalThis.monitoring = getMonitoring();
  }, []);

  // on route
  useEffect(() => {
    // ignore send, send/idle, and passport routes
    if (!['/send/idle', '/send', '/passport'].includes(pathname) && dedicatedApiKey) {
      analytics(dedicatedApiKey).page(pathname, getBaseAnalyticsProperties());
    }

    // handle passport routes separately because they use a different Zustand store
    if (pathname.startsWith('/passport/rpc/') && passportApiKey) {
      analytics(passportApiKey).page(pathname, getBasePassportAnalyticsProperties());
    }
  }, [pathname, searchParams]);

  return null;
}
