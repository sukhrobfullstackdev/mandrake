'use client';

import { DisclaimerLink } from '@app/send/rpc/wallet/mc_login/__components__/disclaimer-link';
import { magicPrivacyPolicyUrl, magicTermsOfServiceUrl } from '@constants/privacy-and-tos-urls';
import { useTranslation } from '@lib/common/i18n';
import { isGlobalAppScope } from '@lib/utils/connect-utils';
import { Text } from '@magiclabs/ui-components';
import { Flex } from '@styled/jsx';
import { token } from '@styled/tokens';

export default function Disclaimer() {
  const { t } = useTranslation('send');
  const isUniversalWallet = isGlobalAppScope();

  return (
    <Flex
      style={{
        maxWidth: '25rem',
        margin: '2rem auto 0',
      }}
      justifyContent="center"
      alignItems="center"
      verticalAlign="center"
    >
      {isUniversalWallet ? (
        <Text aria-label="universal wallet disclaimer" size="sm" styles={{ color: token('colors.text.tertiary') }}>
          {t(
            "By continuing, you acknowledge that you're providing this information directly to Magic pursuant to Magic's",
          )}{' '}
          <DisclaimerLink content={t('privacy policy')} href={magicPrivacyPolicyUrl} /> &{' '}
          <DisclaimerLink content={t('terms')} href={magicTermsOfServiceUrl} />
        </Text>
      ) : null}
      {!isUniversalWallet ? (
        <>
          <Text aria-label="dedicated wallet disclaimer" size="sm">
            <DisclaimerLink content={t('Privacy')} href={magicPrivacyPolicyUrl} />
          </Text>
          <Flex
            style={{
              marginLeft: '0.6rem',
              marginRight: '0.6rem',
              height: '0.2rem',
              width: '0.2rem',
              borderRadius: '50%',
              backgroundColor: token('colors.text.tertiary'),
            }}
          />
          <Text size="sm">
            <DisclaimerLink content={t('Terms')} href={magicTermsOfServiceUrl} />
          </Text>
        </>
      ) : null}
    </Flex>
  );
}
