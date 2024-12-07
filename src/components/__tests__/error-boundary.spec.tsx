import { ErrorBoundary } from '@components/error-boundary';
import { render, screen } from '@testing-library/react';

const Throws = () => {
  throw new Error('Oh no!');
};

describe('@components/error-boundary', () => {
  let onUnhandledSpy: jest.Mock;
  let onErrorSpy: jest.Mock;
  let addErrorSpy: jest.Mock;

  beforeEach(() => {
    onUnhandledSpy = jest.fn();
    onErrorSpy = jest.fn();
    addErrorSpy = jest.fn();

    globalThis.onunhandledrejection = onUnhandledSpy;
    globalThis.onerror = onErrorSpy;
    globalThis.monitoring = {
      addError: addErrorSpy,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const ErrorRenderer = (error: Error) => <h1>Pretty error displayed {error.message}</h1>;

  it('sends errors to addError', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={ErrorRenderer}>
        <Throws />
      </ErrorBoundary>,
    );

    screen.getByText(/Pretty error displayed/i);

    expect(onUnhandledSpy).toHaveBeenCalledTimes(0);
    expect(consoleSpy).toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalled();
    expect(addErrorSpy).toHaveBeenCalledTimes(1);
  });
});
