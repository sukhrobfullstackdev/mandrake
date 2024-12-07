import MenuItem from '@app/passport/rpc/user/components/header/menu-item';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { rejectPopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportStore } from '@hooks/data/passport/store';
import { useTranslation } from '@lib/common/i18n';
import { IcoDownload, IcoMagic } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export default function MenuFooter() {
  const { t } = useTranslation('passport');

  const handleLogout = () => {
    usePassportStore.setState({
      refreshToken: null,
      accessToken: null,
      eoaPublicAddress: null,
    });
    rejectPopupRequest(RpcErrorCode.SessionTerminated, RpcErrorMessage.UserTerminatedSession);
  };

  return (
    <HStack justify="space-between">
      <Box cursor="pointer" width="fit-content" onClick={handleLogout} role="button">
        <MenuItem
          icon={
            <IcoDownload
              height={20}
              width={20}
              color={token('colors.red.300')}
              className={css({ transform: 'rotate(90deg)' })}
            />
          }
          mb={0}
          text={t('Log out')}
          textColor={token('colors.red.300')}
        />
      </Box>
      <IcoMagic color={token('colors.neutral.primary')} />
    </HStack>
  );
}
