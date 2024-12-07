import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { useSearchParams } from 'next/navigation';

const usePayloadOverride = () => {
  const searchParams = useSearchParams();
  const txFromUrl = JSON.parse(searchParams.get('txObject') || '{}');

  const getRpcPayloadOverride = (publicAddress: string) => {
    const rpcPayloadOverride = {
      params: [
        {
          to: txFromUrl.to,
          from: publicAddress,
          value: txFromUrl.value,
          data: txFromUrl.data,
        },
      ],
    };
    return rpcPayloadOverride as JsonRpcRequestPayload;
  };

  return { getRpcPayloadOverride };
};

export default usePayloadOverride;
