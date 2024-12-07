import { NFT_CHECKOUT_STATUS, WALLET_PROVIDERS } from '@constants/nft';

export type NftCheckoutStatus = keyof typeof NFT_CHECKOUT_STATUS;

export type NftTokenInfo = {
  id: string;
  contractId: string;
  contractAddress: string;
  contractChainId: number;
  contractType: string;
  contractCryptoMintFunction: string;
  tokenId: number;
  timeCreated: Date;
  timeUpdated: Date;
  price: number;
  denomination: string;
  maxQuantity: number;
  mintedQuantity: number;
  usdRate: number;
};

export type PaypalClientToken = {
  paypalClientToken: string;
  paypalClientId: string;
  paypalBnCode: string;
  paypalMerchantId: string;
};

export type PaypalOrderDetails = {
  payerEmail: string;
  paymentProviderOrderId: string;
};

export type WalletProvider = (typeof WALLET_PROVIDERS)[keyof typeof WALLET_PROVIDERS];
