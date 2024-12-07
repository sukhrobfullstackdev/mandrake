import { useTranslation } from '@common/i18n';
import { Button, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useRef, useState } from 'react';

export default function RequestNewOtpCode({
  isVisible = true,
  utcRetrygateMs,
  onPressSendNewCode,
}: {
  isVisible: boolean;
  utcRetrygateMs: number;
  onPressSendNewCode: () => void;
}) {
  const interval = useRef<NodeJS.Timeout>();
  const [showSendNewCode, setShowSendNewCode] = useState(false);
  const { t } = useTranslation('send');

  const [otcExpirationSeconds, setOtcExpirationSeconds] = useState(0);

  useEffect(() => {
    if (!otcExpirationSeconds) {
      setShowSendNewCode(true);
      clearInterval(interval.current);
    } else {
      if (showSendNewCode) {
        setShowSendNewCode(false);
      }
      interval.current = setInterval(() => {
        setOtcExpirationSeconds(otcExpirationSeconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [otcExpirationSeconds]);

  useEffect(() => {
    setOtcExpirationSeconds(Math.ceil(Math.abs(new Date(utcRetrygateMs).getTime() - new Date().getTime()) / 1000));
  }, [utcRetrygateMs]);

  return (
    <>
      {isVisible && (
        <Box pt={4}>
          {!showSendNewCode ? (
            <Text
              size="sm"
              styles={{
                color: token('colors.text.tertiary'),
              }}
            >
              {t('New code available in {{seconds}}s', { seconds: String(otcExpirationSeconds) })}
            </Text>
          ) : (
            <Button variant="text" onPress={onPressSendNewCode} label={t('Send a new code')} />
          )}
        </Box>
      )}
    </>
  );
}
