'use client';

import LoginThrottled from '@components/throttled/throttled';

export default function LoginWithSmsThrottled() {
  return <LoginThrottled loginType="SMS" />;
}
