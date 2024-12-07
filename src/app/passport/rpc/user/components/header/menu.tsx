import MenuContent from '@app/passport/rpc/user/components/header/menu-content';
import MenuFooter from '@app/passport/rpc/user/components/header/menu-footer';
import UserProfileGradient from '@app/passport/rpc/user/components/header/user-profile-gradient';
import WalletInfo from '@app/passport/rpc/user/components/header/wallet-info';
import { PassportPage as Page } from '@magiclabs/ui-components';

export default function Menu() {
  return (
    <>
      <Page.Menu.Header>
        <UserProfileGradient />
        <WalletInfo />
      </Page.Menu.Header>
      <Page.Menu.Content>
        <MenuContent />
      </Page.Menu.Content>
      <Page.Menu.Footer>
        <MenuFooter />
      </Page.Menu.Footer>
    </>
  );
}
