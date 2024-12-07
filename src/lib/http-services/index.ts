import { GasHttpService } from '@lib/http-services/embedded/gas-api';
import { GenericJsonHttpService } from '@lib/http-services/generic-json';
import { MagicHttpService } from '@lib/http-services/embedded/magic-api';
import { MagicWalletApiHttpService } from '@lib/http-services/embedded/magic-wallet-api';
import { MandrakeHttpService } from '@lib/http-services/embedded/mandrake-http-service';
import { NewtonExchangeHttpService } from '@lib/http-services/passport/newton-exchange-http-service';
import { NftHttpService } from '@lib/http-services/embedded/nft-api';
import { PassportIdentityHttpService } from '@lib/http-services/passport/passport-identity-api';
import { PassportOpsHttpService } from '@lib/http-services/passport/passport-ops-api';
import { RelayerHttpService } from '@lib/http-services/embedded/relayer';
import { MagicIndexerHttpService } from '@lib/http-services/passport/magic-indexer-api';

export const HttpService = {
  // Embedded services
  Magic: new MagicHttpService(),
  Relayer: new RelayerHttpService(),
  MagicApiWallet: new MagicWalletApiHttpService(),
  Nft: new NftHttpService(),
  Gas: new GasHttpService(),
  Mandrake: new MandrakeHttpService(),

  // Passport services
  NewtonExchange: new NewtonExchangeHttpService(),
  MagicIndexer: new MagicIndexerHttpService(),
  PassportOps: new PassportOpsHttpService(),
  PassportIdentity: new PassportIdentityHttpService(),

  // Third party service JSON
  JSON: new GenericJsonHttpService(),
};
