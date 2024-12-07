'use client';

import { useTranslation } from '@lib/common/i18n';
import { Callout } from '@magiclabs/ui-components';

export default function BrowserNotSupported() {
  const { t } = useTranslation('passport');

  return (
    <Callout
      size="md"
      variant="error"
      label={t('Browser not supported')}
      description={t('Please try again using Chrome, Safari, Edge, or another browser that supports passkeys')}
    />
  );
}
