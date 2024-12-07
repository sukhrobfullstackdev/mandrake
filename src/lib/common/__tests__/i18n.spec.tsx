import { useSetLanguage, useTranslation } from '@lib/common/i18n';
import { render } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import I18nProvider from 'next-translate/I18nProvider';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));
jest.mock<typeof import('next/navigation')>('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  const nextRouterMock = jest.requireActual('next-router-mock');
  const { useRouter } = nextRouterMock;
  const usePathname = jest.fn().mockImplementation(() => {
    const router = useRouter();
    return router.asPath;
  });

  const useSearchParams = jest.fn().mockImplementation(() => {
    const router = useRouter();
    return new URLSearchParams(router.query);
  });

  return {
    ...actual,
    useRouter: jest.fn().mockImplementation(useRouter),
    usePathname,
    useSearchParams,
  };
});

describe('@lib/i18n', () => {
  it('should translate text', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const Inner = () => {
      const { t } = useTranslation('testns');
      const testText = t('foo bar');

      return (
        <>
          {testText} | {typeof testText}
        </>
      );
    };

    const { container } = render(
      <I18nProvider lang="en" namespaces={{}}>
        <Inner />
      </I18nProvider>,
    );

    expect(mockRouter).toMatchObject({
      asPath: '/',
      pathname: '/',
      query: {},
    });
    expect(container.textContent).toBe('foo bar | string');
    expect(warn).toHaveBeenCalledWith(
      '[next-translate] "testns:171088983" is missing in current namespace configuration. Try adding "171088983" to the namespace "testns".',
    );
  });

  it('should set a language', async () => {
    const Inner = () => {
      const setLanguage = useSetLanguage();
      setLanguage('foo');

      return <p>foo</p>;
    };

    render(<Inner />);

    expect(mockRouter).toMatchObject({
      asPath: '/?lang=foo',
      pathname: '/',
      query: {},
    });
  });
});
