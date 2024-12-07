import { ENVType } from '@constants/env';

export const ethereumProviderUrls = {
  [ENVType.Test]: {
    mainnet: [],
    goerli: ['https://eth-goerli.g.alchemy.com/v2/XDkXOl3fIkG3-XFvRmaa313PPJEehNx4'],
    sepolia: ['https://eth-sepolia.g.alchemy.com/v2/lnkxjj_rKFZRHqrrIvoerSJtzIdt2ElK'],
  },
  [ENVType.Local]: {
    mainnet: ['https://eth-mainnet.alchemyapi.io/v2/THLzcjj0X_ktVcj80LZ60_twjxdWuUso'],
    goerli: ['https://eth-goerli.g.alchemy.com/v2/XDkXOl3fIkG3-XFvRmaa313PPJEehNx4'],
    sepolia: ['https://eth-sepolia.g.alchemy.com/v2/lnkxjj_rKFZRHqrrIvoerSJtzIdt2ElK'],
  },
  [ENVType.Dev]: {
    mainnet: [],
    goerli: ['https://eth-goerli.g.alchemy.com/v2/XDkXOl3fIkG3-XFvRmaa313PPJEehNx4'],
    sepolia: ['https://eth-sepolia.g.alchemy.com/v2/lnkxjj_rKFZRHqrrIvoerSJtzIdt2ElK'],
  },
  [ENVType.Stagef]: {
    mainnet: ['https://eth-mainnet.alchemyapi.io/v2/THLzcjj0X_ktVcj80LZ60_twjxdWuUso'],
    goerli: ['https://eth-goerli.g.alchemy.com/v2/XDkXOl3fIkG3-XFvRmaa313PPJEehNx4'],
    sepolia: ['https://eth-sepolia.g.alchemy.com/v2/lnkxjj_rKFZRHqrrIvoerSJtzIdt2ElK'],
  },
  [ENVType.PreviewDeployments]: {
    mainnet: ['https://eth-mainnet.alchemyapi.io/v2/THLzcjj0X_ktVcj80LZ60_twjxdWuUso'],
    goerli: ['https://eth-goerli.g.alchemy.com/v2/XDkXOl3fIkG3-XFvRmaa313PPJEehNx4'],
    sepolia: ['https://eth-sepolia.g.alchemy.com/v2/lnkxjj_rKFZRHqrrIvoerSJtzIdt2ElK'],
  },
  [ENVType.Prod]: {
    mainnet: ['https://eth-mainnet.alchemyapi.io/v2/2K3ZYHyus86aJQOTmeZOJu3KD1dlWW67'],
    goerli: ['https://eth-goerli.g.alchemy.com/v2/EyJ3Z0OYYb7uUVmlyFkxzBpqzuSbjrAj'],
    sepolia: ['https://eth-sepolia.g.alchemy.com/v2/OZixRaakGk_D2pr9s-yTrDJpAjdbvVGL'],
  },
};
