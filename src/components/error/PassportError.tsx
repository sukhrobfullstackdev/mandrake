'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { rejectPopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportPageError } from '@hooks/passport/use-passport-error';
import { Button, IconWarningDark, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import useTranslation from 'next-translate/useTranslation';
import { FC } from 'react';

interface PassportErrorProps {
  errorCode: PassportPageErrorCodes;
}

export const PassportError: FC<PassportErrorProps> = ({ errorCode }) => {
  const { t } = useTranslation('passport');
  const { heading, body } = usePassportPageError(errorCode);

  const handleClose = () => {
    rejectPopupRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
  };

  return (
    <VStack mt={4}>
      <IconWarningDark height={48} width={48} />
      <Text.H3 styles={{ textAlign: 'center' }}>{heading}</Text.H3>
      <Box
        className={css({
          backgroundColor: 'negative.lightest',
          color: 'ruby.30',
          paddingX: '8',
          paddingY: '4',
          textAlign: 'center',
          borderRadius: 'lg',
          marginTop: '8',
        })}
      >
        <Text size="sm" styles={{ color: token('colors.negative.base') }}>
          {body}
        </Text>
      </Box>
      <Box
        className={css({
          position: 'absolute',
          bottom: '8',
          width: '100%',
          paddingX: '8',
        })}
      >
        <Button expand label={t('Close')} variant="inverse" onPress={handleClose} />
      </Box>
    </VStack>
  );
};
