'use client';

import { useLoginContext } from '@app/send/login-context';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { IcoLockLocked, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useRef, useState } from 'react';

export default function LoginThrottled({ loginType = 'SMS' }: { loginType?: string }) {
  const { t } = useTranslation('send');
  const loginContext = useLoginContext();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const interval = useRef<NodeJS.Timeout>();
  const [retrygateSeconds, setRetrygateSeconds] = useState(
    Math.ceil(Math.abs(new Date(loginContext.utcRetrygateMs).getTime() / 1000)),
  );

  useEffect(() => {
    loginContext.setLoginState({ ...loginContext, showCloseButton: false });
  }, []);

  useEffect(() => {
    if (!retrygateSeconds) {
      clearInterval(interval.current);
      rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UserLockoutLifted);
    } else {
      interval.current = setInterval(() => {
        setRetrygateSeconds(retrygateSeconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [retrygateSeconds]);

  return (
    <>
      <Page.Icon>
        <IcoLockLocked />
      </Page.Icon>
      <Page.Content className={css({ px: 0 })}>
        <VStack
          gap={3}
          className={css({
            minHeight: '12rem',
          })}
        >
          <VStack gap={5}>
            <Text.H4>{t('Security Lockout')}</Text.H4>
            <Text styles={{ textAlign: 'center' }}>
              {t(
                `Due to a suspicious number of failed login attempts, ${loginType} login has been temporarily disabled.`,
              )}
            </Text>
            {retrygateSeconds > 0 && (
              <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
                {t('Try again in')} {retrygateSeconds}s
              </Text>
            )}
          </VStack>
        </VStack>
      </Page.Content>
    </>
  );
}
