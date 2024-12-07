import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import { getCallsFromParams } from '@lib/utils/rpc-calls';
import { IcoExternalLink, Text, WalletAddress } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { Network } from 'magic-passport/types';
import Link from 'next/link';

const TransactionToAddress = () => {
  const { t } = useTranslation('passport');
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const popupPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  const calls = getCallsFromParams(popupPayload?.params);
  const toAddress = calls?.[0]?.to as `0x${string}` | undefined;
  const blockExplorerUrl = `${network.blockExplorers?.default.url}/address/${toAddress}`;

  const handleCopy = () => {
    if (!toAddress) return;
    copyToClipboard(toAddress);
  };

  return (
    <HStack width={'100%'} justifyContent={'space-between'} mb={4}>
      <Text fontColor={'text.secondary'}>{t('Destination')}</Text>
      <HStack>
        {toAddress ? <WalletAddress fontColor={'text.secondary'} address={toAddress} onCopy={handleCopy} /> : null}
        <Link href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
          <IcoExternalLink color={token('colors.text.tertiary')} height={14} width={14} />
        </Link>
      </HStack>
    </HStack>
  );
};

export default TransactionToAddress;
