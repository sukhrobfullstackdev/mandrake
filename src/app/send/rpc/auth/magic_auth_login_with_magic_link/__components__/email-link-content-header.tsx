import { useTranslation } from '@lib/common/i18n';
import { EmailWbr, IcoEdit, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import React from 'react';

const EmailLinkContentHeader = ({ email }: { email: string }) => {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const onEdit = () => {
    rejectActiveRpcRequest(RpcErrorCode.UserRequestEditEmail, RpcErrorMessage.UserRequestEditEmail);
  };
  const { t } = useTranslation('send');

  return (
    <VStack gap={1} mb={4}>
      <Text.H4
        styles={{
          textAlign: 'center',
        }}
      >
        {t('Check your email')}
      </Text.H4>
      <Text>
        {t('Log in using the magic link sent to')}
        <br />
      </Text>
      <HStack gap={1}>
        <Text styles={{ textAlign: 'center' }}>
          <EmailWbr email={email} />
        </Text>
        <button className={css({ cursor: 'pointer' })} onClick={onEdit}>
          <IcoEdit height={18} width={18} color={token('colors.brand.base')} />
        </button>
      </HStack>
    </VStack>
  );
};

export default EmailLinkContentHeader;
