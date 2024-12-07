/**
 * Execute a list of `Promise` factories in sequence.
 */
export async function sequentialPromise(tasks: (() => Promise<void>)[]) {
  for (const task of tasks) {
    try {
      await task();
    } catch (error) {
      console.error('Error resolving sequential promise: ', error);
    }
  }
}
