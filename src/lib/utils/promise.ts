import { isServer } from '@utils/context';

export const timedPromiseWithFallback = <T = unknown>(
  promise: () => Promise<T>,
  fallback: () => Promise<T>,
  timeoutIntervalInMs?: number,
) => {
  return new Promise<T>((resolve, reject) => {
    const log = isServer ? console : logger;

    const fallbackPromise = () => {
      fallback()
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    };
    const timeoutId = setTimeout(() => {
      log.log(`Request timed out ${timeoutIntervalInMs}ms, executing given falling back`);
      fallbackPromise();
    }, timeoutIntervalInMs);

    promise()
      .then(response => {
        clearTimeout(timeoutId); // Clear the timeout if fetch is successful
        resolve(response);
      })
      .catch(e => {
        log.log(`Primary promise failed, executing given falling back`, { e });
        clearTimeout(timeoutId); // Clear the timeout and execute the fallback directly
        fallbackPromise();
      });
  });
};
