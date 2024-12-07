import Menu from '@app/passport/rpc/user/components/header/menu';
import { useTranslation } from '@lib/common/i18n';
import { PassportPage } from '@magiclabs/ui-components';

export default function TransactionHeader() {
  const { t } = useTranslation('passport');

  return (
    <>
      <PassportPage.Title title={t('Confirm Transaction')} />
      <PassportPage.Menu>
        <Menu />
      </PassportPage.Menu>
    </>
  );
}
