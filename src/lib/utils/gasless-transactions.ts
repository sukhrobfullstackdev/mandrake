import { Endpoint } from '@constants/endpoint';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { HttpService } from '@lib/http-services';
import { EIP712TypedData } from 'eth-sig-util';
import { Contract, TransactionRequest } from 'ethers';

export const MUMBAI_FORWARDER_CONTRACT_ADDRESS = '0xB7B46474aAA2729e07EEC90596cdD9772b29Ecfb';
export const AMOY_FORWARDER_CONTRACT_ADDRESS = '0xe4567ACcE23D69666B19f5C13b77c51488e41d0F';
export const GHOSTNET_FORWARDER_CONTRACT_ADDRESS = '0xe4567ACcE23D69666B19f5C13b77c51488e41d0F';
export const POLYGON_FORWARDER_CONTRACT_ADDRESS = '0xC077831B87CB5c335982f54b670eF8F0A04c71c6';

export const FORWARDER_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
      { indexed: false, internalType: 'bytes', name: 'domainValue', type: 'bytes' },
    ],
    name: 'DomainRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'index', type: 'uint256' },
      { indexed: true, internalType: 'bool', name: 'failedVerify', type: 'bool' },
      { indexed: true, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'bytes', name: 'returnData', type: 'bytes' },
    ],
    name: 'ExecutionResult',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'userAddress', type: 'address' },
      { indexed: true, internalType: 'address', name: 'relayerAddress', type: 'address' },
      { indexed: true, internalType: 'bytes', name: 'functionSignature', type: 'bytes' },
    ],
    name: 'MetaTransactionExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'EIP712_DOMAIN_TYPE',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REQUEST_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'gas', type: 'uint256' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct ForwardRequestTypes.ForwardRequest[]',
        name: 'reqs',
        type: 'tuple[]',
      },
      { internalType: 'bytes32[]', name: 'domainSeparators', type: 'bytes32[]' },
      { internalType: 'bytes[]', name: 'sigs', type: 'bytes[]' },
    ],
    name: 'batchExecute',
    outputs: [
      { internalType: 'bool[]', name: 'successes', type: 'bool[]' },
      { internalType: 'bool[]', name: 'failedVerifies', type: 'bool[]' },
      { internalType: 'bytes[]', name: 'rets', type: 'bytes[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'domains',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'from', type: 'address' }],
    name: 'getNonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'grantAdminRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'version', type: 'string' },
    ],
    name: 'registerDomainSeparator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'revokeAdminRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'gas', type: 'uint256' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct ForwardRequestTypes.ForwardRequest',
        name: 'req',
        type: 'tuple',
      },
      { internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
      { internalType: 'bytes', name: 'sig', type: 'bytes' },
    ],
    name: 'verify',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
];

export const FORWARDER_REQUEST_TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'chainId', type: 'uint256' },
  ],
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
};

export const DESTINATION_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_userWallet', type: 'address' },
      { internalType: 'uint256', name: '_quantity', type: 'uint256' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

const getNonceAddition = ({ publicAddress, chainId }: { publicAddress: string; chainId: number }) => {
  return HttpService.Gas.Get(`${Endpoint.Gas.GetNonceAddition}?public_address=${publicAddress}&chain_id=${chainId}`);
};

export const getRequestState = ({
  requestId,
}: {
  requestId: string;
}): Promise<{
  txHash: string;
  txReceipt: string;
  gasSpent: number;
  requestId: string;
  state: string;
}> => {
  return HttpService.Gas.Get(`${Endpoint.Gas.GetRequestState}?request_id=${requestId}`);
};

export async function buildForwardPayload(address: string, transaction: TransactionRequest) {
  if (!transaction.to || !transaction.data) {
    throw new Error('Invalid transaction');
  }

  const provider = getRpcProvider();
  const { chainId: chainIdBigInt } = await provider.getNetwork();

  const chainId = Number(chainIdBigInt);

  type ChainIdMap = {
    137: string;
    80001: string;
    80002: string;
    128123: string;
  };

  const chainIdMap: ChainIdMap = {
    137: POLYGON_FORWARDER_CONTRACT_ADDRESS,
    80001: MUMBAI_FORWARDER_CONTRACT_ADDRESS,
    80002: AMOY_FORWARDER_CONTRACT_ADDRESS,
    128123: GHOSTNET_FORWARDER_CONTRACT_ADDRESS,
  };

  const contractAddress = chainIdMap[chainId as keyof ChainIdMap];
  if (!contractAddress) throw Error(`Unsupported gas subsidy chain ${chainId}`);

  const forwarderContract = new Contract(contractAddress, FORWARDER_ABI, provider);
  const nonce = Number(await forwarderContract.getNonce(address));
  const { nonceAddition } = await getNonceAddition({ publicAddress: address, chainId });

  const forwardRequestMessage = {
    from: address,
    to: transaction.to,
    value: 0,
    gas: transaction.gasLimit ?? 1e6,
    nonce: nonce + nonceAddition,
    data: transaction.data,
  };

  return {
    types: FORWARDER_REQUEST_TYPES,
    primaryType: 'ForwardRequest',
    domain: {
      name: 'MagicForwarderV5',
      version: '1',
      verifyingContract: contractAddress,
      chainId,
    },
    message: forwardRequestMessage,
  } as EIP712TypedData;
}
