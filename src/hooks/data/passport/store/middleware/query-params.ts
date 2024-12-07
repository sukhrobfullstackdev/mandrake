import { Middleware, MiddlewareHandler } from '.';

const queryParamHandler: MiddlewareHandler = config => (set, get, store) => {
  type Updater = Parameters<typeof set>[0];

  store.setState = (updater, replace, ...rest) => {
    const { decodedQueryParams, magicApiKey } = get();
    const nextState = typeof updater === 'function' ? updater(get()) : updater;

    set(nextState, replace, ...rest);

    if (
      nextState.decodedQueryParams &&
      JSON.stringify(decodedQueryParams) !== JSON.stringify(nextState.decodedQueryParams)
    ) {
      set({
        magicApiKey: nextState.decodedQueryParams.apiKey || magicApiKey || null,
        decodedQueryParams: nextState.decodedQueryParams,
      } as Updater);
    }
  };

  return config(store.setState, get, store);
};

export const queryParamMiddleware = queryParamHandler as unknown as Middleware;
