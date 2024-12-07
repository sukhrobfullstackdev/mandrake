import { ValidRoutesConfig } from '@app/send/rpc/routes';

export const nftRoutes: ValidRoutesConfig = {
  magic_nft_checkout: { module: 'nft', isServerRoute: true },
  magic_nft_transfer: { module: 'nft', isServerRoute: true },
};
