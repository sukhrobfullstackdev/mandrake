import {
  AlgodRpcMethods,
  AptosRpcMethods,
  AvaRpcMethods,
  BtcRpcMethods,
  CfxRpcMethods,
  CosRpcMethods,
  EdRpcMethods,
  FlowRpcMethods,
  HederaRpcMethods,
  HmyRpcMethods,
  IcxRpcMethods,
  KdaRpcMethods,
  NearRpcMethods,
  PdtRpcMethods,
  SolRpcMethods,
  SuiRpcMethods,
  TaquitoRpcMethods,
  TerraRpcMethods,
  TezosRpcMethods,
  ZilRpcMethods,
} from '@constants/multichain-rpc-methods';
import { WalletType } from '@custom-types/wallet';

type LedgerSupportDictionaryType = {
  [key in WalletType]: Record<string, string>;
};

export const LedgerSupportDictionary: LedgerSupportDictionaryType = {
  [WalletType.ETH]: {
    // not handled here
  },
  [WalletType.ICON]: {
    [IcxRpcMethods.ICX_GETBALANCE]: 'getBalance',
    [IcxRpcMethods.ICX_SENDTRANSACTION]: 'sendTransaction',
    [IcxRpcMethods.ICX_SIGNTRANSACTION]: 'signTransaction',
    [IcxRpcMethods.ICX_GETACCOUNT]: 'getAccount',
  },

  [WalletType.POLKADOT]: {
    [PdtRpcMethods.PDT_SIGNPAYLOAD]: 'signPayload',
    [PdtRpcMethods.PDT_SIGNRAW]: 'signRaw',
    [PdtRpcMethods.PDT_SENDTRANSACTION]: 'sendTransaction',
    [PdtRpcMethods.PDT_GETBALANCE]: 'getBalance',
    [PdtRpcMethods.PDT_GETACCOUNT]: 'getAccount',
    [PdtRpcMethods.PDT_CONTRACTCALL]: 'contractCall',
  },

  [WalletType.HARMONY]: {
    [HmyRpcMethods.HMY_GETBALANCE]: 'getBalance',
    [HmyRpcMethods.HMY_SENDTRANSACTION]: 'sendTransaction',
  },

  [WalletType.FLOW]: {
    [FlowRpcMethods.FLOW_SIGNTRANSACTION]: 'signTransaction',
    [FlowRpcMethods.FLOW_GETACCOUNT]: 'getAccount',
    [FlowRpcMethods.FLOW_COMPOSESENDTRANSACTION]: 'composeSendFlow',
    [FlowRpcMethods.FLOW_COMPOSESENDUSDC]: 'composeSendUsdc',
    [FlowRpcMethods.FLOW_SIGNMESSAGE]: 'signMessage',
  },

  [WalletType.TEZOS]: {
    [TezosRpcMethods.TEZOS_SENDTRANSACTION]: 'sendTransaction',
    [TezosRpcMethods.TEZOS_SENDCONTRACTORIGINATIONOPERATION]: 'sendContractOrigination',
    [TezosRpcMethods.TEZOS_GETACCOUNT]: 'getAccount',
    [TezosRpcMethods.TEZOS_SENDCONTRACTINVOCATIONOPERATION]: 'sendContractInvocation',
    [TezosRpcMethods.TEZOS_SENDCONTRACTPING]: 'sendContractPingOperation',
    [TezosRpcMethods.TEZOS_SENDDELEGATIONOPERATION]: 'sendDelegation',
  },

  [WalletType.ZILLIQA]: {
    [ZilRpcMethods.ZIL_SENDTRANSACTION]: 'sendTransaction',
    [ZilRpcMethods.ZIL_DEPLOYCONTRACT]: 'deployContract',
    [ZilRpcMethods.ZIL_CALLCONTRACT]: 'callContract',
    [ZilRpcMethods.ZIL_GETWALLET]: 'getWallet',
  },
  [WalletType.SOLANA]: {
    [SolRpcMethods.SOL_SENDTRANSACTION]: 'sendTransaction',
    [SolRpcMethods.SOL_SIGNTRANSACTION]: 'signTransaction',
    [SolRpcMethods.SOL_SIGNMESSAGE]: 'signMessage',
    [SolRpcMethods.SOL_PARTIALSIGNTRANSACTION]: 'partialSignTransaction',
  },
  [WalletType.SUI]: {
    [SuiRpcMethods.SUI_SIGNANDSENDTRANSACTION]: 'signAndSendTransaction',
  },
  [WalletType.AVAX]: {
    [AvaRpcMethods.AVA_SIGNTRANSACTION]: 'signTransaction',
    [AvaRpcMethods.AVA_GETACCOUNT]: 'getAccount',
  },
  [WalletType.ALGOD]: {
    [AlgodRpcMethods.ALGOD_SIGNTRANSACTION]: 'signTransaction',
    [AlgodRpcMethods.ALGOD_SIGNBID]: 'signBid',
    [AlgodRpcMethods.ALGOD_GETACCOUNT]: 'getAccount',
    [AlgodRpcMethods.ALGOD_SIGNGROUPTRANSACTION]: 'signGroupTransaction',
    [AlgodRpcMethods.ALGOD_SIGNGROUPTRANSACTIONV2]: 'signGroupTransactionV2',
  },
  [WalletType.COSMOS]: {
    [CosRpcMethods.COS_SIGN]: 'sign',
    [CosRpcMethods.COS_SENDTOKENS]: 'sendTokens',
    [CosRpcMethods.COS_SIGNANDBROADCAST]: 'signAndBroadcast',
    [CosRpcMethods.COS_CHANGEADDRESS]: 'changeAddress',
  },
  [WalletType.BITCOIN]: {
    [BtcRpcMethods.BTC_SIGNTRANSACTION]: 'signTransaction',
  },
  [WalletType.NEAR]: {
    [NearRpcMethods.NEAR_SIGNTRANSACTION]: 'signTransaction',
    [NearRpcMethods.NEAR_GETPUBLICKEY]: 'getPublicKey',
  },
  [WalletType.CONFLUX]: {
    [CfxRpcMethods.CFX_SENDTRANSACTION]: 'sendTransaction',
  },
  [WalletType.TERRA]: {
    [TerraRpcMethods.TERRA_SIGN]: 'sign',
    [TerraRpcMethods.TERRA_GETPUBLICKEY]: 'getPublicKey',
  },
  [WalletType.TAQUITO]: {
    [TaquitoRpcMethods.TAQUITO_SIGN]: 'sign',
    [TaquitoRpcMethods.TAQUITO_GETPUBLICKEYANDHASH]: 'getPublicKeyAndHash',
  },
  [WalletType.ED]: {
    [EdRpcMethods.ED_GETPUBLICKEY]: 'getPublicKey',
    [EdRpcMethods.ED_SIGN]: 'sign',
  },
  [WalletType.HEDERA]: {
    [HederaRpcMethods.HEDERA_SIGN]: 'sign',
    [HederaRpcMethods.HEDERA_GETPUBLICKEY]: 'getPublicKey',
  },
  [WalletType.APTOS]: {
    [AptosRpcMethods.APTOS_GETACCOUNT]: 'getAccount',
    [AptosRpcMethods.APTOS_SIGNTRANSACTION]: 'signTransaction',
    [AptosRpcMethods.APTOS_GETACCOUNTINFO]: 'getAccountInfo',
    [AptosRpcMethods.APTOS_SIGNANDSUBMITTRANSACTION]: 'signAndSubmitTransaction',
    [AptosRpcMethods.APTOS_SIGNANDSUBMITBCSTRANSACTION]: 'signAndSubmitBCSTransaction',
    [AptosRpcMethods.APTOS_SIGNMESSAGE]: 'signMessage',
    [AptosRpcMethods.APTOS_SIGNMESSAGEANDVERIFY]: 'signMessageAndVerify',
  },
  [WalletType.KADENA]: {
    [KdaRpcMethods.KDA_SIGNTRANSACTION]: 'signTransaction',
    [KdaRpcMethods.KDA_LOGINWITHSPIREKEY]: 'loginWithSpireKey',
    [KdaRpcMethods.KDA_GETINFO]: 'getInfo',
  },
};

export const FlowAddress = {
  testnet: '5a729f879230d5d2',
  mainnet: '0ef92cecf95ba19e',
} as const;

export const HederaAccounts = {
  testnet: {
    accountId: '0.0.3579958', // Account ID from portal.hedera.com
    publicKey: '302a300506032b6570032100497112c22231ec1886cd76163aec7709a677ceb4ea0bf3f2a29ae1ea05f46fbc', // DER encoded public key from portal.hedera.com
  },
  mainnet: {
    accountId: '0.0.1319851',
    publicKey: '302a300506032b65700321003fb848db6eacf859dcdd0af9c883b228adbbb4d5aed92d162320ff7b10c5d638',
  },
} as const;

export const KadenaPublicKeys = {
  testnet: '4e610b1987ed7fcd4a39389ace5afb6cc7980598af9a37ad8c896ecb72a67598',
  mainnet: 'f3aa4ce0ad24f9e089b1638e77872c342d524f843c24160d4867319113dd3ea9',
};
