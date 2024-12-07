import { useStore } from '@hooks/store';

export const getFooterLabel = (locale: string) => {
  if (locale === 'en-US' || locale === 'en') {
    return 'Secured By';
  }
  return '';
};

export function useLocale() {
  const { locale } = useStore(state => state.decodedQueryParams) || '';

  return locale?.replace('_', '-') ?? 'en-US';
}
