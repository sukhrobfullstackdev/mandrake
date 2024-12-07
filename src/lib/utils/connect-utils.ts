import { useStore } from '@hooks/store';

export const isGlobalAppScope = (): boolean => {
  return useStore.getState().isGlobalAppScope;
};

export const setGlobalAppScopeHeaders = () =>
  isGlobalAppScope() ? { 'X-Magic-Scope': 'global' } : { 'X-Magic-Scope': '' };
