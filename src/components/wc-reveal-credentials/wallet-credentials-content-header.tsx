'use client';

import { CredentialType, WalletCredentials } from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__types__';
import { WalletType } from '@custom-types/wallet';
import { useStore } from '@hooks/store';

import { useTranslation } from '@lib/common/i18n';
import { getWalletType } from '@lib/utils/network-name';
import { Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

const WalletCredentialsContentHeader = ({ credentialType }: WalletCredentials) => {
  const { t } = useTranslation('send');
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const walletType = getWalletType(ethNetwork, ext);
  const isSeedPhrase = credentialType === CredentialType.SeedPhrase && walletType !== WalletType.SOLANA;

  const headerText = isSeedPhrase ? t('Recovery Phrase') : t('Wallet Private Key');
  const credentialText = isSeedPhrase ? 'recovery phrase' : 'private key';
  const bodyText = t(
    'Please only reveal your {{credentialText}} privately. Store it in a secure place that only you have access.',
    { credentialText },
  );

  return (
    <VStack gap={2} mt={2} w="90%">
      <Text.H4 styles={{ fontWeight: 600, color: '#E4E7E7' }}>{headerText}</Text.H4>
      <Text styles={{ textAlign: 'center', fontWeight: 500, color: '#949E9E', letterSpacing: '-0.03rem' }}>
        {bodyText}
      </Text>
    </VStack>
  );
};

export default WalletCredentialsContentHeader;
