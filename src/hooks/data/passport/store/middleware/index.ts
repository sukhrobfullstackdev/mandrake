import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PassportStoreState } from '..';
import { queryParamMiddleware } from './query-params';

// types
export type Middleware = <
  T extends PassportStoreState,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

export type MiddlewareHandler = (
  config: StateCreator<PassportStoreState, [], []>,
) => StateCreator<PassportStoreState, [], []>;

// add your middleware here
const middlewareList: Middleware[] = [devtools as unknown as Middleware, queryParamMiddleware];

// compose all middlewares
const composeMiddleware =
  (middlewares: Middleware[]): Middleware =>
  config =>
    middlewares.reduce((prev, curr) => curr(prev), config);

export const middleware = composeMiddleware(middlewareList);
