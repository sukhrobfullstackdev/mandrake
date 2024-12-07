import { AwsCredentialIdentity } from '@aws-sdk/types';
import { DkmsService } from '@lib/dkms';
import { TransactionRequest, Wallet } from 'ethers';

export const signTransactionForUser = async (
  credentials: AwsCredentialIdentity,
  secret: string,
  transaction: TransactionRequest,
) => {
  try {
    const privateKey = await DkmsService.reconstructSecret(credentials, secret);

    const account = new Wallet(privateKey);
    return await account.signTransaction(transaction);
  } catch (e) {
    logger.error(`Error signing transaction: ${JSON.stringify(transaction)}`, e);
    throw e;
  }
};
