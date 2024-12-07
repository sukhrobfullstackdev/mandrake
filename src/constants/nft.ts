export const NFT_CHECKOUT_STATUS = {
  HYDRATE_SESSION: 'HYDRATE_SESSION',

  // payment method states
  PAYMENT_METHODS: 'PAYMENT_METHODS',

  // paypal checkout states
  PAYPAL_CHECKOUT: 'PAYPAL_CHECKOUT',
  CARD_PAYMENT: 'CARD_PAYMENT',

  // crypto checkout states
  CRYPTO_CHECKOUT: 'CRYPTO_CHECKOUT',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',

  // minting states
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  NOW_AVAILABLE: 'NOW_AVAILABLE',

  // error states
  ITEM_SOLD_OUT: 'ITEM_SOLD_OUT',
  PRE_SALE_SOLD_OUT: 'PRE_SALE_SOLD_OUT',
  PRICE_ESTIMATE_EXPIRED: 'PRICE_ESTIMATE_EXPIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SOMETHING_WENT_WRONG: 'SOMETHING_WENT_WRONG',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_ALLOWED: 'NOT_ALLOWED',

  // etc
  RECEIVE_FUNDS: 'RECEIVE_FUNDS',
} as const;

export const REQUEST_STATUS = {
  QUEUE: 'QUEUE',
  MINTED: 'MINTED',
  MINT_FAILED: 'MINT_FAILED',
  IN_PROGRESS: 'IN_PROGRESS',
  WEBHOOK_SUCCESS_SENT: 'WEBHOOK_SUCCESS_SENT',
  WEBHOOK_FAILED_SENT: 'WEBHOOK_FAILED_SENT',
} as const;

export const MINTING_STATUS = {
  APPROVED: 'APPROVED',
  CREATING_ITEM: 'CREATING_ITEM',
  PREPARING: 'PREPARING',
  DELIVERING: 'DELIVERING',
  DELIVERED: 'DELIVERED',
  DONE: 'DONE',
} as const;

export const PAYPAL_ERROR_MESSAGES = {
  DETECTED_POPUP_CLOSE: 'Detected popup close',
  NOT_ENOUGH_AVAILABLE_TOKENS: 'Not enough available tokens',
  FAILED_TO_GET_TOKEN_INFO: 'Failed to fetch NFT token info',
} as const;

export const WALLET_PROVIDERS = {
  WEB3MODAL: 'web3modal',
  MAGIC: 'magic',
} as const;

export const NFT_LOADING_IMAGE_URL =
  'https://bafybeiafmvgagcvorojjmip3y2afmjcakhmakovrbaxrr4hf7smftn6cfq.ipfs.dweb.link/nft-loading-image.svg';

export const NFT_LOADING_IMAGE_DARK_URL =
  'https://bafybeiafmvgagcvorojjmip3y2afmjcakhmakovrbaxrr4hf7smftn6cfq.ipfs.dweb.link/nft-loading-image-dark.svg';

export const NFT_NO_IMAGE_URL =
  'https://bafybeiafmvgagcvorojjmip3y2afmjcakhmakovrbaxrr4hf7smftn6cfq.ipfs.dweb.link/nft-no-image.svg';

export const NFT_NO_IMAGE_DARK_URL =
  'https://bafybeiafmvgagcvorojjmip3y2afmjcakhmakovrbaxrr4hf7smftn6cfq.ipfs.dweb.link/nft-no-image-dark.svg';

export const NFT_PASSPORT_NO_IMAGE_URL = '/images/nft-passport-no-image.svg';

export const NFT_TRANSFER_ROUTES = {
  COMPOSE: '/send/rpc/nft/magic_nft_transfer',
  PREVIEW: '/send/rpc/nft/magic_nft_transfer/preview',
  CONFIRM: '/send/rpc/nft/magic_nft_transfer/confirmed',
  ERROR: '/send/rpc/nft/magic_nft_transfer/error',
  EXPIRED: '/send/rpc/nft/magic_nft_transfer/expired',
  CANCELED: '/send/rpc/nft/magic_nft_transfer/canceled',
  NOT_SUPPORTED: '/send/rpc/nft/magic_nft_transfer/not-supported',
  INVALID_PARAMS: '/send/rpc/nft/magic_nft_transfer/invalid-params',
} as const;
