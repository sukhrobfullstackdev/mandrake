import { data } from '@services/web-storage/data-api';
import localforage from 'localforage';

export const logLocalForage = async (name?: string) => {
  const localStorageData: Record<string, unknown> = {};
  try {
    const keys = await data.keys();
    for (const key of keys) {
      localStorageData[key] = await data.getItem(key);
    }
    logger.info(`LocalForage at ${name} in ${localforage.driver()}: `, localStorageData);
  } catch (error) {
    logger.error('Failed to log LocalStorage', error);
  }
};
