import TokenList from '@components/show-ui/token-list';
import WalletBalance from '@components/show-ui/wallet-balance';
import { Page } from '@magiclabs/ui-components';

const ShowBalances = () => {
  return (
    <Page.Content>
      <WalletBalance />
      <TokenList />
    </Page.Content>
  );
};

export default ShowBalances;
