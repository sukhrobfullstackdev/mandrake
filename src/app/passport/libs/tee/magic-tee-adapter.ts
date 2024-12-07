/* istanbul ignore file */

import { PASSPORT_OPS_API_URL } from '@constants/env';
import { type IViemInjectableTeeAccountObj } from './viem-injectable-tee-account-obj';

export const createMagicTeeAdapter = (config: { eoaPublicAddress: string; endpoint?: string; accessToken: string }) => {
  const passportOpsUrl = config.endpoint || PASSPORT_OPS_API_URL;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.accessToken}`,
  };
  return {
    address: config.eoaPublicAddress,
    signMessage: async ({ message }) => {
      let rawDataHash;
      if (typeof message === 'string') {
        rawDataHash = message;
      } else {
        rawDataHash = message?.raw;
      }
      try {
        const signMessageUrl = `${passportOpsUrl}/v1/data/sign`;
        const signMessageResponse = await (
          await fetch(signMessageUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ raw_data_hash: rawDataHash }),
          })
        ).json();

        return signMessageResponse.signature;
      } catch (e) {
        logger.error(e);
      }
    },
    signTransaction: async transaction => {
      logger.info('signTransaction: ', transaction);
      throw new Error('signTransaction not implemented');
    },
    signTypedData: async parameters => {
      logger.info('signTypedData: ', parameters);
      throw new Error('signTypedData not implemented');
    },
    source: 'custom',
    type: 'local',
    publicKey: config.eoaPublicAddress,
    nonceManager: undefined,
  } as IViemInjectableTeeAccountObj;
};
