import { useTranslation } from '@lib/common/i18n';
import { PassportPage } from '@magiclabs/ui-components';

interface CancelButtonProps {
  isSending: boolean;
  onPress: () => void;
}

function TransactionCancelButton({ isSending, onPress }: CancelButtonProps) {
  const { t } = useTranslation('passport');
  return <PassportPage.Cancel label={t('Cancel')} onPress={onPress} disabled={isSending} />;
}

export default TransactionCancelButton;
