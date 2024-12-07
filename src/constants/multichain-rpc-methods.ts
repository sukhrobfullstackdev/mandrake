export enum HederaRpcMethods {
  HEDERA_SIGN = 'hedera_sign',
  HEDERA_GETPUBLICKEY = 'hedera_getPublicKey',
}
export enum SolRpcMethods {
  SOL_SIGNMESSAGE = 'sol_signMessage',
  SOL_SIGNTRANSACTION = 'sol_signTransaction',
  SOL_SENDTRANSACTION = 'sol_sendTransaction',
  SOL_PARTIALSIGNTRANSACTION = 'sol_partialSignTransaction',
}

export enum CosRpcMethods {
  COS_SIGN = 'cos_sign',
  COS_SENDTOKENS = 'cos_sendTokens',
  COS_SIGNANDBROADCAST = 'cos_signAndBroadcast',
  COS_CHANGEADDRESS = 'cos_changeAddress',
  COS_SIGNTYPEDDATA = 'cos_signTypedData',
}

export enum SuiRpcMethods {
  SUI_SIGNANDSENDTRANSACTION = 'sui_signAndSendTransaction',
}

export enum BtcRpcMethods {
  BTC_SIGNTRANSACTION = 'btc_signTransaction',
}

export enum CfxRpcMethods {
  CFX_SENDTRANSACTION = 'cfx_sendTransaction',
}

export enum HmyRpcMethods {
  HMY_GETBALANCE = 'hmy_getBalance',
  HMY_SENDTRANSACTION = 'hmy_sendTransaction',
}

export enum AvaRpcMethods {
  AVA_GETACCOUNT = 'ava_getAccount',
  AVA_SIGNTRANSACTION = 'ava_signTransaction',
}

export enum NearRpcMethods {
  NEAR_SIGNTRANSACTION = 'near_signTransaction',
  NEAR_GETPUBLICKEY = 'near_getPublicKey',
}

export enum TerraRpcMethods {
  TERRA_SIGN = 'terra_sign',
  TERRA_GETPUBLICKEY = 'terra_getPublicKey',
}

export enum EdRpcMethods {
  ED_SIGN = 'ed_sign',
  ED_GETPUBLICKEY = 'ed_getPublicKey',
}

export enum TaquitoRpcMethods {
  TAQUITO_SIGN = 'taquito_sign',
  TAQUITO_GETPUBLICKEYANDHASH = 'taquito_getPublicKeyAndHash',
}

export enum IcxRpcMethods {
  ICX_GETBALANCE = 'icx_getBalance',
  ICX_SENDTRANSACTION = 'icx_sendTransaction',
  ICX_SIGNTRANSACTION = 'icx_signTransaction',
  ICX_GETACCOUNT = 'icx_getAccount',
}

export enum ZilRpcMethods {
  ZIL_SENDTRANSACTION = 'zil_sendTransaction',
  ZIL_DEPLOYCONTRACT = 'zil_deployContract',
  ZIL_CALLCONTRACT = 'zil_callContract',
  ZIL_GETWALLET = 'zil_getWallet',
}

export enum AlgodRpcMethods {
  ALGOD_SIGNTRANSACTION = 'algod_signTransaction',
  ALGOD_SIGNBID = 'algod_signBid',
  ALGOD_GETACCOUNT = 'algod_getAccount',
  ALGOD_SIGNGROUPTRANSACTION = 'algod_signGroupTransaction',
  ALGOD_SIGNGROUPTRANSACTIONV2 = 'algod_signGroupTransactionV2',
}

export enum PdtRpcMethods {
  PDT_SIGNPAYLOAD = 'pdt_signPayload',
  PDT_SIGNRAW = 'pdt_signRaw',
  PDT_SENDTRANSACTION = 'pdt_sendTransaction',
  PDT_GETBALANCE = 'pdt_getBalance',
  PDT_GETACCOUNT = 'pdt_getAccount',
  PDT_CONTRACTCALL = 'pdt_contractCall',
}

export enum AptosRpcMethods {
  APTOS_GETACCOUNT = 'aptos_getAccount',
  APTOS_SIGNTRANSACTION = 'aptos_signTransaction',
  APTOS_GETACCOUNTINFO = 'aptos_getAccountInfo',
  APTOS_SIGNANDSUBMITTRANSACTION = 'aptos_signAndSubmitTransaction',
  APTOS_SIGNANDSUBMITBCSTRANSACTION = 'aptos_signAndSubmitBCSTransaction',
  APTOS_SIGNMESSAGE = 'aptos_signMessage',
  APTOS_SIGNMESSAGEANDVERIFY = 'aptos_signMessageAndVerify',
}

export enum TezosRpcMethods {
  TEZOS_SENDTRANSACTION = 'tezos_sendTransaction',
  TEZOS_SENDCONTRACTORIGINATIONOPERATION = 'tezos_sendContractOriginationOperation',
  TEZOS_GETACCOUNT = 'tezos_getAccount',
  TEZOS_SENDCONTRACTINVOCATIONOPERATION = 'tezos_sendContractInvocationOperation',
  TEZOS_SENDCONTRACTPING = 'tezos_sendContractPing',
  TEZOS_SENDDELEGATIONOPERATION = 'tezos_sendDelegationOperation',
}

export enum FlowRpcMethods {
  FLOW_GETACCOUNT = 'flow_getAccount',
  FLOW_SIGNTRANSACTION = 'flow_signTransaction',
  FLOW_COMPOSESENDTRANSACTION = 'flow_composeSendTransaction',
  FLOW_COMPOSESENDUSDC = 'flow_composeSendUsdc',
  FLOW_SIGNMESSAGE = 'flow_signMessage',
}

export enum KdaRpcMethods {
  KDA_SIGNTRANSACTION = 'kda_signTransaction',
  KDA_LOGINWITHSPIREKEY = 'kda_loginWithSpireKey',
  KDA_GETINFO = 'kda_getInfo',
}
