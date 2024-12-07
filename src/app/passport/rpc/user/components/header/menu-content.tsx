import MenuItem from '@app/passport/rpc/user/components/header/menu-item';
import { useTranslation } from '@lib/common/i18n';
import { IcoShield } from '@magiclabs/ui-components';

export default function MenuContent() {
  const { t } = useTranslation('passport');
  return (
    <>
      <MenuItem icon={<IcoShield height={20} width={20} />} text={t('Add recovery email')} tooltip />
      {/* My Passport link will be ready for mainnet, not devnet yet */}
      {/* <MenuItem icon={<IcoPassport height={20} width={20} />} text={t('My Passport')} includeExternalLink /> */}
      {/* Help link not available for devnet */}
      {/* <MenuItem icon={<IcoQuestionCircle height={20} width={20} />} text={t('Help')} includeExternalLink /> */}
    </>
  );
}
