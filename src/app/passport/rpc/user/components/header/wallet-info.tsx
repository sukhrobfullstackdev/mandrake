import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import truncateAddress from '@lib/utils/truncate-address';
import { IcoCheckmarkCircle, IcoCopy, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useState } from 'react';

export default function WalletInfo() {
  const [isCopied, setIsCopied] = useState(false);
  const { smartAccount } = useSmartAccount();
  const { t } = useTranslation('passport');

  const handleCopyClick = () => {
    setIsCopied(true);
    copyToClipboard(smartAccount?.address);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <HStack alignItems={'center'} mt={'1rem'} onClick={handleCopyClick} cursor={'pointer'} w={'fit-content'}>
      <Text fontColor="text.secondary">
        {smartAccount?.address ? truncateAddress(smartAccount.address) : t('loading...')}
      </Text>
      {isCopied ? (
        <IcoCheckmarkCircle height={18} width={18} color={token('colors.text.tertiary')} />
      ) : (
        <IcoCopy height={18} width={18} color={token('colors.text.tertiary')} />
      )}
    </HStack>
  );
}
