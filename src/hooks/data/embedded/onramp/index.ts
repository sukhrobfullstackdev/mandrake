import { PaypalOrderStatus, PaypalStep, StripeClientToken } from '@custom-types/onramp';
import {
  GetPaypalOrderResponse,
  GetStripeClientTokenParams,
  makePaypalGetOrderFetcher,
  makeSardineClientTokenFetcher,
  makeStripeClientTokenFetcher,
  SardineClientTokenParams,
} from '@hooks/data/embedded/onramp/fetchers';
import {
  GetPaypalOrderQueryKey,
  GetSardineClientTokenQueryKey,
  GetStripeClientTokenQueryKey,
  onrampQueryKeys,
} from '@hooks/data/embedded/onramp/keys';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';

export const useStripeClientToken = (
  params: GetStripeClientTokenParams,
  config?: Omit<
    UseQueryOptions<StripeClientToken, Error, StripeClientToken, GetStripeClientTokenQueryKey>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<StripeClientToken, ApiResponseError, StripeClientToken, GetStripeClientTokenQueryKey>({
    queryKey: onrampQueryKeys.getStripeClientToken(params),
    queryFn: makeStripeClientTokenFetcher(),
    ...config,
  });
};

export const useSardineClientToken = (
  params: SardineClientTokenParams,
  config?: Omit<UseQueryOptions<string, Error, string, GetSardineClientTokenQueryKey>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<string, ApiResponseError, string, GetSardineClientTokenQueryKey>({
    queryKey: onrampQueryKeys.getSardineClientToken(params),
    queryFn: makeSardineClientTokenFetcher(),
    ...config,
  });
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const TEN_SECONDS = 10 * SECOND;
const FIVE_MINUTES = 5 * MINUTE;

export const usePaypalOrderPoller = (
  orderId: string | undefined,
  authUserId: string,
  handleError: () => void,
  previousStep: PaypalStep,
) => {
  const [intervalMs, setIntervalMs] = useState(TEN_SECONDS);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleMaxPollingTime = (maxPollingTime: number) => {
    if (timeElapsed >= maxPollingTime) {
      handleError();
    } else {
      setIntervalMs(intervalMs * 2);
    }
  };

  const { data } = useQuery<GetPaypalOrderResponse, Error, GetPaypalOrderResponse, GetPaypalOrderQueryKey>({
    queryKey: onrampQueryKeys.getPaypalOrder({ auth_user_id: authUserId, order_entry_id: orderId! }),
    enabled: !!orderId,
    refetchInterval: intervalMs,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    queryFn: makePaypalGetOrderFetcher(),
  });

  if (!data?.orders[0]) return { orderStatus: undefined, orderTransactionLink: undefined };

  const orderStatus: PaypalStep = data.orders[0].status as PaypalStep;
  const orderTransactionLink: string | undefined = data.orders[0].links[0].href;

  if (previousStep !== orderStatus) {
    setIntervalMs(TEN_SECONDS);
    setTimeElapsed(0);
  }

  if (orderStatus === PaypalOrderStatus.INITIATED && timeElapsed >= FIVE_MINUTES) {
    handleMaxPollingTime(HOUR);
  } else if (orderStatus === PaypalOrderStatus.PENDING && timeElapsed >= HOUR) {
    handleMaxPollingTime(DAY);
  } else if (orderStatus === PaypalOrderStatus.COMPLETED) {
    setIntervalMs(0);
  } else if (orderStatus === PaypalOrderStatus.FAILED) {
    handleError();
  }

  setTimeElapsed(prevTime => prevTime + intervalMs);

  return { orderStatus, orderTransactionLink };
};
