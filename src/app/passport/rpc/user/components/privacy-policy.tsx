'use client';

import { magicPrivacyPolicyUrl, magicTermsOfServiceUrl } from '@constants/privacy-and-tos-urls';
import { usePassportAppConfig } from '@hooks/data/passport/app-config';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import Link from 'next/link';

interface PassportPrivacyPolicyProps {
  showMagicDisclaimer?: boolean;
}

export default function PassportPrivacyPolicy({ showMagicDisclaimer = true }: PassportPrivacyPolicyProps) {
  const { t } = useTranslation('passport');
  const appConfig = usePassportAppConfig();
  const appName = showMagicDisclaimer ? 'Magic' : appConfig?.name || '';
  const termsOfServiceUrl = showMagicDisclaimer ? magicTermsOfServiceUrl : appConfig?.termsOfServiceUri;
  const privacyPolicyUrl = showMagicDisclaimer ? magicPrivacyPolicyUrl : appConfig?.privacyPolicyUri;

  return (
    <>
      {termsOfServiceUrl || privacyPolicyUrl ? (
        <Text size="sm" fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
          {t('By continuing, you agree to')} {appName}&apos;s{' '}
          {privacyPolicyUrl && (
            <Link
              href={privacyPolicyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: token('colors.text.secondary'),
                opacity: '0.85',
                fontWeight: '600',
              }}
            >
              {t('Privacy Policy')}
            </Link>
          )}
          {termsOfServiceUrl && privacyPolicyUrl && <> {t('and')} </>}
          {termsOfServiceUrl && (
            <Link
              href={termsOfServiceUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: token('colors.text.secondary'),
                opacity: '0.85',
                fontWeight: '600',
              }}
            >
              {t('Terms of Service')}
            </Link>
          )}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
}
