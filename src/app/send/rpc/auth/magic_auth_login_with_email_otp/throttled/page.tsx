'use client';

import LoginThrottled from '@components/throttled/throttled';

export default function LoginWithEmailThrottled() {
  return <LoginThrottled loginType="Email" />;
}
