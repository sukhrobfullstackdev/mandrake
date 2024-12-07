/* istanbul ignore file */
'use client';

import Development from '@app/development';
import Production from '@app/production';
import { NODE_ENV } from '@constants/env';

export default function Page() {
  return NODE_ENV === 'production' ? <Production /> : <Development />;
}
