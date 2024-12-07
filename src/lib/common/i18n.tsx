import murmur from 'murmurhash-js';
import { type TransProps, type TranslationQuery } from 'next-translate';
import Trans from 'next-translate/Trans';
import useNextTranslation from 'next-translate/useTranslation';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactElement } from 'react';

const UNTRANSLATED = '__UNTRANSLATED__';

interface Toptions {
  fallback?: string | string[];
  returnObjects?: boolean;
  default?: string;
  ns?: string;
}

// Omit i18nKey from TransProps as we use translate as the key
interface TProps extends Omit<TransProps, 'i18nKey' | 'components' | 'defaultTrans'> {
  children: ReactElement<{ id: string }> | ReactElement<{ id: string }>[];
  translate: string;
}

// Based on: https://github.com/aralroca/next-translate/blob/master/src/transCore.tsx
function interpolation({ text, query }: { text?: string; query?: TranslationQuery | null }): string {
  if (!text || !query) return text || '';

  const escapeRegex = (str: string) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const prefix = '{{'; // no current fallback support for custom value.
  const suffix = '}}'; // no current fallback support for custom value.

  const regexEnd = `(?:[\\s,]+([\\w-]*))?\\s*${escapeRegex(suffix)}`;
  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(`${escapeRegex(prefix)}\\s*${varKey}${regexEnd}`, 'gm');

    return all.replace(regex, () => {
      return query[varKey] as string;
    });
  }, text);
}

export function useSetLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (locale: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set('lang', locale);

    const search = current.toString();
    const query = `${'?'.repeat(search.length && 1)}${search}`;

    router.replace(`${pathname}${query}`);
  };
}

export function useTranslation(namespace: string) {
  const { t, lang } = useNextTranslation(namespace);
  const translate = (i18nKey: string, query?: TranslationQuery, options?: Toptions): string => {
    const hashedKey = murmur.murmur3(i18nKey).toString();
    const result = t(hashedKey, query, options) || i18nKey;

    if (result === UNTRANSLATED) {
      const fallback = Array.isArray(options?.fallback) ? options.fallback[0] : options?.fallback;
      return fallback ? fallback : interpolation({ text: i18nKey, query });
    }

    return result === hashedKey ? i18nKey : result;
  };
  return { t: translate, lang };
}

export const T = (props: TProps) => {
  // convert children array to an object where the keys are the IDs.
  // The same keys are expected to be used on the default translation as placeholders.
  const { children, translate } = props;
  const childrenMap = (Array.isArray(children) ? children : [children]).reduce(
    (acc: { [key: string]: ReactElement }, child) => {
      acc[child.props.id] = child;
      return acc;
    },
    {},
  );
  return <Trans i18nKey={translate} defaultTrans={translate} components={childrenMap} {...props} />;
};
