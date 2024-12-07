import { sequentialPromise } from '@lib/utils/sequential-promise';

describe('sequentialPromise', () => {
  it('should resolve all promises in sequence', async () => {
    const tasks = [Promise.resolve('Task 1'), Promise.resolve('Task 2'), Promise.resolve('Task 3')];

    const results = [] as string[];
    await sequentialPromise(
      tasks.map(task => async () => {
        const result = await task;
        results.push(result);
      }),
    );

    expect(results).toEqual(['Task 1', 'Task 2', 'Task 3']);
  });
});
