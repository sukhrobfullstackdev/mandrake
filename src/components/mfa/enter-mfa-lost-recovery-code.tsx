'use client';
import { useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Page, Text } from '@magiclabs/ui-components';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import MfaPageHeader from './mfa-page-header';

interface EnterMfaLostRecoveryCodeProps {
  onPressBack: () => void;
  showCloseButton?: boolean;
}

const EnterMfaLostRecoveryCode = ({ onPressBack, showCloseButton }: EnterMfaLostRecoveryCodeProps) => {
  const { t } = useTranslation('send');
  const appName = useAppName();
  const pathname = usePathname();

  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
  }, []);

  return (
    <>
      <MfaPageHeader onPressBack={onPressBack} showCloseButton={showCloseButton} />
      <Page.Content>
        <Text.H4
          styles={{
            textAlign: 'center',
          }}
        >
          {t(`Contact ${appName} support`)}
        </Text.H4>
        <Text
          styles={{
            textAlign: 'center',
          }}
        >
          {t(`For help recovering your account, please contact the {{appName}} support team.`, { appName })}
        </Text>
      </Page.Content>
    </>
  );
};

export default EnterMfaLostRecoveryCode;
