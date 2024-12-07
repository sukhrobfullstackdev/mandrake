import SynchronousWeb3Operations from '@lib/utils/synchronous-web3-operations';
import Web3Service from '@utils/web3-services/web3-service';
import { isMobileSdk } from '@utils/platform';

export async function generateUserId(publicAddress: string | null) {
  let checksumAddress;
  if (!isMobileSdk() && navigator?.serviceWorker) {
    checksumAddress = await Web3Service.toChecksumAddress(publicAddress);
  } else {
    checksumAddress = SynchronousWeb3Operations.toChecksumAddress(publicAddress);
  }
  return `did:ethr:${checksumAddress}`;
}
