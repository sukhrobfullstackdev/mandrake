/* istanbul ignore file */

import { HIGHTOUCH_API_HOST, HIGHTOUCH_API_KEY } from '@constants/env';
import { HtEventsBrowser } from '@ht-sdks/events-sdk-js-browser';

const disabledApiKeys = [
  'pk_live_B080E9DC31E5875E', // prod - AppKit
  'pk_live_AF06597262D441D3', // prod - AppKit Solana
  'pk_live_0EDD8758638BE74B', // prod - AppKit Dev
  'pk_live_5C775C647F3CB11E', // stagef - test app
];

const mockAnalytics = {
  track: () => {},
  identify: () => {},
  page: () => {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let analyticsInstance: any;

function analytics(apiKey: string | null) {
  if (analyticsInstance) {
    return analyticsInstance;
  }
  if (typeof window !== 'undefined') {
    if (apiKey) {
      if (disabledApiKeys.includes(apiKey)) {
        analyticsInstance = mockAnalytics;
      } else {
        analyticsInstance = HtEventsBrowser.load({ writeKey: HIGHTOUCH_API_KEY }, { apiHost: HIGHTOUCH_API_HOST });
      }
      return analyticsInstance;
    }
  }
  return mockAnalytics;
}

export { analytics };
