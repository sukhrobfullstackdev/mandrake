import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { useMemo } from 'react';

interface StatusHeaderProps {
  isPending: boolean;
  isConfirming?: boolean;
  errorMessage: string;
}

const StatusHeader = ({ isPending, isConfirming, errorMessage }: StatusHeaderProps) => {
  const { t } = useTranslation('send');

  const statusText = useMemo(() => {
    if (errorMessage) {
      return t('Something went wrong');
    }
    if (isConfirming) {
      return `${t('Confirming login')}...`;
    }
    if (isPending) {
      return t('Continue in SpireKey');
    }
    return t('Connected');
  }, [isConfirming, isPending, errorMessage]);

  return <Text.H4 styles={{ textAlign: 'center' }}>{statusText}</Text.H4>;
};

export default StatusHeader;
