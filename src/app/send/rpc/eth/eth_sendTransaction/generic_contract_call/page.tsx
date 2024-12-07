'use client';

import { Page } from '@magiclabs/ui-components';

// Note: we do not distinguish between contract tx's vs normal sending tokens
// (other than erc20) - this page can remain a placeholder in case product/design
// decides to handle this case differently
export default function EthSendTransactionGenericContractCall() {
  return <Page.Content>ETH Send Transaction Generic Contract Call</Page.Content>;
}
