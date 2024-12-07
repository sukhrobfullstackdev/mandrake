'use client';

import CreateWallet from '@components/wallet/create-wallet';
import { useAssetUri } from '@hooks/common/client-config';
import { ClientAssetLogo } from '@magiclabs/ui-components';

const SocialLoginWalletCreatePage = () => {
  const assetUri = useAssetUri();
  return <CreateWallet pageIcon={<ClientAssetLogo assetUri={assetUri} />} />;
};

export default SocialLoginWalletCreatePage;
