import { timedPromiseWithFallback } from '../promise';

describe('timedPromiseWithFallback', () => {
  jest.useFakeTimers();

  it('should resolve with the primary promise if it succeeds before timeout', async () => {
    const primaryPromise = () => Promise.resolve('primary');
    const fallbackPromise = () => Promise.resolve('fallback');

    const result = timedPromiseWithFallback(primaryPromise, fallbackPromise, 500);
    jest.advanceTimersByTime(100);
    expect(await result).toBe('primary');
  });

  it('should resolve with the fallback promise if the primary fails', async () => {
    const primaryPromise = () => Promise.reject(new Error('primary error'));
    const fallbackPromise = () => Promise.resolve('fallback');

    const result = timedPromiseWithFallback(primaryPromise, fallbackPromise, 500);
    expect(await result).toBe('fallback');
  });

  it('should resolve with the fallback promise if the primary promise times out', async () => {
    const primaryPromise = () => new Promise(() => {}); // Never resolves or rejects
    const fallbackPromise = () => Promise.resolve('fallback');

    const result = timedPromiseWithFallback(primaryPromise, fallbackPromise, 500);
    jest.advanceTimersByTime(500);
    expect(await result).toBe('fallback');
  });

  it('should reject with the fallback promise if the primary promise times out and fallback fails', async () => {
    const primaryPromise = () => new Promise(() => {}); // Never resolves or rejects
    const fallbackPromise = () => Promise.reject(new Error('fallback error'));

    const result = timedPromiseWithFallback(primaryPromise, fallbackPromise, 500);
    jest.advanceTimersByTime(500);
    await expect(result).rejects.toThrow('fallback error');
  });
});
