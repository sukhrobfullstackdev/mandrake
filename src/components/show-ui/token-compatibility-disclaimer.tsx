import { WalletType } from '@custom-types/wallet';
import { useChainInfo } from '@hooks/common/chain-info';
import { useTranslation } from '@lib/common/i18n';
import { getIndeterminateArticle } from '@lib/utils/string-utils';
import { Text } from '@magiclabs/ui-components';

export default function WalletCompatibilityDisclaimer() {
  const { chainInfo, walletType } = useChainInfo();
  const { t } = useTranslation('send');

  return (
    <Text size="sm" styles={{ fontWeight: 400, textAlign: 'center' }}>
      {t(`This is ${getIndeterminateArticle(chainInfo?.networkName || '')}`)}{' '}
      <strong style={{ fontWeight: 'bold' }}>{chainInfo?.networkName}</strong> {t('wallet.')}{' '}
      {walletType === WalletType.ETH
        ? t(`Only send ${chainInfo?.currency} or other ${chainInfo?.tokenCompatibility} tokens to this wallet.`)
        : t(
            `Only send ${chainInfo?.currency}, ${chainInfo?.tokenCompatibility}, or other ${chainInfo?.currency} tokens to this address`,
          )}
    </Text>
  );
}
