import { Endpoint } from '@constants/endpoint';

type NextFetchRequestConfigs = { [key: string]: NextFetchRequestConfig };

// This only applies to static route handler of GET()
export const nextFetchRequestConfigs: NextFetchRequestConfigs = {
  [Endpoint.MagicClient.Config]: {
    revalidate: 60 * 15, // 15 minute
  },
};
