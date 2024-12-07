import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useRouter } from 'next/navigation';
import qs from 'qs';

export function useSendRouter() {
  const router = useRouter();
  const { locale } = useStore(state => state.decodedQueryParams);

  return new Proxy(router, {
    get(target, prop, receiver) {
      return (newRouteWithParams: string) => {
        const normalizedLocale = locale?.replace('_', '-');
        const [newRoute, newParams] = newRouteWithParams.split('?');
        let modifiedRoute = newRoute;

        if (newParams && normalizedLocale) {
          const queryObj = qs.parse(newParams);
          queryObj.lang = normalizedLocale;
          modifiedRoute = `${newRoute}?${qs.stringify(queryObj)}`;
        } else if (!newParams && normalizedLocale) {
          modifiedRoute = `${newRoute}?lang=${normalizedLocale}`;
        } else if (newParams && !normalizedLocale) {
          modifiedRoute = `${newRoute}?${newParams}`;
        }

        AtomicRpcPayloadService.startPerformanceTimer(newRoute);

        return Reflect.get(target, prop, receiver).call(target, modifiedRoute);
      };
    },
  });
}
