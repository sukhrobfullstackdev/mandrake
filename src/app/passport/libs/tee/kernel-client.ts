/* istanbul ignore file */
import { NetworkIdViemChainMap, networkZerodevProjectIds } from '@app/passport/constants/network';
import { createMagicTeeAdapter } from '@app/passport/libs/tee/magic-tee-adapter';
import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
import { CAB_V0_1, createKernelCABClient, EnableCABSupportedToken } from '@zerodev/cab';
import { toMultiChainECDSAValidator } from '@zerodev/multi-chain-validator';
import { createKernelAccount, createKernelAccountClient } from '@zerodev/sdk';
import { KERNEL_V3_1 } from '@zerodev/sdk/constants';
import { arbitrumSepolia, baseSepolia, newtonSepolia, polygonAmoy, sepolia } from 'magic-passport/networks';
import { Network } from 'magic-passport/types';
import { bundlerActions, ENTRYPOINT_ADDRESS_V07, walletClientToSmartAccountSigner } from 'permissionless';
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { createClient, createPublicClient, createWalletClient, http } from 'viem';

// TODO: replace with vercel env variables https://magiclink.atlassian.net/browse/M2PB-173
const ZERODEV_BUNDLER_RPC_URL = 'https://rpc.zerodev.app/api/v2/bundler';
// const ZERODEV_PAYMASTER_RPC = 'https://rpc.zerodev.app/api/v2/paymaster';

// TODO: talk to zero dev to get a prod cab paymaster
const CAB_PAYMASTER_URL = `https://cab-paymaster-service.onrender.com/paymaster/api`;

// TODO: add this to env vars.
const PIMLICO_API_KEY = 'pim_AL3KkGTxXj5tFuaEqm3Yyt';

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const kernelVersion = KERNEL_V3_1;
const cabVersion = CAB_V0_1;

export const CabEnabledNetworks: Required<EnableCABSupportedToken>['networks'] = [
  sepolia.id,
  arbitrumSepolia.id,
  baseSepolia.id,
  polygonAmoy.id,
  newtonSepolia.id,
];

const getZerodevBundlerRpcUrl = (network: Network) => {
  return `${ZERODEV_BUNDLER_RPC_URL}/${networkZerodevProjectIds[network.id]}`;
};

const getPublicClient = (config: { network: Network }) => {
  return createPublicClient({ chain: NetworkIdViemChainMap[config?.network.id], transport: http() });
};

const getSmartAccount = async (config: { eoaPublicAddress: string; accessToken: string; network: Network }) => {
  const { eoaPublicAddress, accessToken, network } = config;

  if (!networkZerodevProjectIds[network.id]) throw new Error('Network not supported');

  const account = createMagicTeeAdapter({ eoaPublicAddress, accessToken });

  const walletClient = createWalletClient({ account, transport: http(network?.rpcUrls.default.http[0]) });

  const signer = walletClientToSmartAccountSigner(walletClient);

  const publicClient = createPublicClient({ chain: NetworkIdViemChainMap[network.id], transport: http() });

  const sudo = await toMultiChainECDSAValidator(publicClient, { signer, entryPoint, kernelVersion });

  const kernelAccount = await createKernelAccount(publicClient, { plugins: { sudo }, entryPoint, kernelVersion });

  return kernelAccount as PassportSmartAccount;
};

const getCABKernelClient = (config: { smartAccount: PassportSmartAccount; network: Network }) => {
  const { network, smartAccount } = config;

  const kernelClient = createKernelAccountClient({
    account: smartAccount,
    entryPoint,
    chain: NetworkIdViemChainMap[network.id],
    bundlerTransport: http(getZerodevBundlerRpcUrl(network)),
  });

  const cabClient = createKernelCABClient(kernelClient, { transport: http(CAB_PAYMASTER_URL), entryPoint, cabVersion });

  return { cabClient, kernelClient };
};

const enableCab = async (smartAccount: PassportSmartAccount, network: Network) => {
  const { cabClient } = getCABKernelClient({ smartAccount, network });

  if (!cabClient) throw new Error('enableCab: CAB client not found');

  await cabClient.enableCAB({
    tokens: [
      {
        name: '6TEST',
        networks: CabEnabledNetworks,
      },
    ],
  });
};

const getSingleChainKernelClient = (config: { smartAccount: PassportSmartAccount; network: Network }) => {
  const { network, smartAccount: account } = config;

  const pimlicoApiUrl = `https://api.pimlico.io/v2/${network.id}/rpc?apikey=${PIMLICO_API_KEY}`;

  const pimlicoBundlerClient = createClient({
    chain: NetworkIdViemChainMap[network.id],
    transport: http(pimlicoApiUrl),
  })
    .extend(bundlerActions(entryPoint))
    .extend(pimlicoBundlerActions(entryPoint));

  const kernelClient = createKernelAccountClient({
    account,
    entryPoint,
    chain: NetworkIdViemChainMap[network.id],
    bundlerTransport: http(pimlicoApiUrl),
    middleware: {
      gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
      sponsorUserOperation: ({ userOperation, entryPoint: e }) => {
        const paymasterClient = createPimlicoPaymasterClient({
          chain: NetworkIdViemChainMap[network.id],

          transport: http(pimlicoApiUrl),
          entryPoint: e,
        });
        return paymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });
  return kernelClient;
};
const isAccountCABEnabledOnNetwork = (smartAccount: PassportSmartAccount, network: Network) => {
  return getCABKernelClient({ smartAccount, network }).cabClient.getEnabledChains();
};

const KernelClientService = {
  getSmartAccount,
  getCABKernelClient,
  enableCab,
  getPublicClient,
  getSingleChainKernelClient,
  isAccountCABEnabledOnNetwork,
};

export default KernelClientService;
