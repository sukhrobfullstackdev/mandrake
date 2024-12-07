import { customNodeQuery, ethereumNodeEthProxyQuery } from '@hooks/data/embedded/ethereum-proxy';
import { DecodedQueryParams } from '@hooks/store';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { getCustomNodeNetworkUrl, isCustomNode } from '@utils/network-name';

export const genericEthProxy = (payload: JsonRpcRequestPayload, ethNetwork?: DecodedQueryParams['ethNetwork']) => {
  if (isCustomNode(ethNetwork)) {
    const nodeUrl = getCustomNodeNetworkUrl(ethNetwork);

    if (nodeUrl) {
      return customNodeQuery(payload, nodeUrl);
    }
  }
  return ethereumNodeEthProxyQuery(payload);
};
