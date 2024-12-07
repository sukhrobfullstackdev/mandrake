import { isServer } from '@lib/utils/context';
import { useMemo, useRef } from 'react';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

export const usePassportStoreSync = <T>(
  useClientStore: UseBoundStore<StoreApi<T>>,
  state: T,
): UseBoundStore<StoreApi<T>> => {
  const unsynced = useRef(true);
  const useServerStore = useMemo(() => create<T>(() => state), []);

  if (unsynced.current) {
    useClientStore.setState(state);
    unsynced.current = false;
  }

  return isServer ? useServerStore : useClientStore;
};
