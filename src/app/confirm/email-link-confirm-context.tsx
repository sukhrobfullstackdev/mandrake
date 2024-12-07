'use client';

import { useLoginContext } from '@app/send/login-context';
import { useNewTabContext } from '@components/new-tab/new-tab-context';
import { EmailLinkConfirmErrorState } from '@constants/email-link';
import { EMAIL_LINK_CONFIRM_METADATA_KEY } from '@constants/storage';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { LoadingSpinner, Page } from '@magiclabs/ui-components';
import { data } from '@services/web-storage/data-api';
import { VStack } from '@styled/jsx';
import { camelizeKeys } from '@utils/object-helpers';
import { getParsedQueryParams } from '@utils/query-string';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type EmailLinkConfirmQueryParams = {
  tlt: string;
  e?: 'testnet' | 'mainnet';
  ct?: string;
  uid?: string;
  locale?: string;
  location?: string;
  redirectUrl?: string;
  ak: string;
  flowContext?: string;
  nextFactor: string;
  securityOtpChallenge: string;
};

const initConfirmState = {
  e: 'testnet',
  ak: '',
  tlt: '',
  nextFactor: '',
} as EmailLinkConfirmQueryParams;

export type EmailLinkConfirmStateContext = {
  isQueryHydrated: boolean;
  setConfirmState: (state: EmailLinkConfirmQueryParams) => void;
} & EmailLinkConfirmQueryParams;

export const EmailLinkConfirmContext = createContext<EmailLinkConfirmStateContext>({
  ...initConfirmState,
  isQueryHydrated: false,
  setConfirmState: () => {},
});

export const EmailLinkConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [confirmState, setConfirmState] = useState<EmailLinkConfirmQueryParams>(initConfirmState);
  const [isQueryHydrated, setIsQueryHydrated] = useState(false);
  const loginContext = useLoginContext();
  const { isThemeLoaded } = useNewTabContext();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const persistConfirmState = async (parsedQuery: EmailLinkConfirmQueryParams) => {
      useStore.setState({ magicApiKey: parsedQuery.ak });
      await data.setItem(EMAIL_LINK_CONFIRM_METADATA_KEY, parsedQuery);
    };
    if (pathname === '/confirm') {
      const parsedQuery = camelizeKeys(getParsedQueryParams(searchParams.toString())) as EmailLinkConfirmQueryParams;

      if (parsedQuery.flowContext) {
        loginContext.setLoginState({ ...loginContext, loginFlowContext: parsedQuery.flowContext });
      }
      setConfirmState(parsedQuery);
      setIsQueryHydrated(true);
      persistConfirmState(parsedQuery);
    }
  }, [pathname, searchParams]);

  const { data: clientConfig } = useClientConfigQuery(
    { magicApiKey: confirmState.ak || '' },
    {
      enabled: !!confirmState.ak,
    },
  );

  useEffect(() => {
    if (!isQueryHydrated) return;
    if (!confirmState.tlt) {
      router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.LinkBroken}`);
    }
  }, [isQueryHydrated, confirmState, router]);

  useEffect(() => {
    const rehydrateConfirmState = async () => {
      const confirmStateFromStore = (await data.getItem(
        EMAIL_LINK_CONFIRM_METADATA_KEY,
      )) as EmailLinkConfirmQueryParams;
      if (confirmStateFromStore && !confirmState.tlt) {
        useStore.setState({ magicApiKey: confirmStateFromStore?.ak });

        if (confirmState.flowContext) {
          loginContext.setLoginState({ ...loginContext, loginFlowContext: confirmState.flowContext });
        }
        setConfirmState(confirmStateFromStore);
        setIsQueryHydrated(true);
      }
    };

    // For other page, if the confirm state is not hydrated, rehydrate it from the store
    // For confirm page, if query is lost, rehydrate it from the store
    if ((pathname !== '/confirm' || !searchParams.toString) && !confirmState.tlt && !isQueryHydrated) {
      rehydrateConfirmState();
    }
  }, [confirmState, isQueryHydrated]);

  useEffect(() => {
    if (clientConfig) {
      setTimeout(() => {
        setIsQueryHydrated(true);
      }, 1000);
    }
  }, [clientConfig]);

  const renderChildren = () => {
    return isQueryHydrated ? (
      <>{children}</>
    ) : (
      <Page.Content>
        <VStack gap={3} my={3}>
          <LoadingSpinner size={36} strokeWidth={4} />
        </VStack>
      </Page.Content>
    );
  };

  return (
    <EmailLinkConfirmContext.Provider value={{ ...confirmState, setConfirmState, isQueryHydrated }}>
      <Page backgroundType="solid" isOpen={isThemeLoaded}>
        {renderChildren()}
        <Page.Footer showLogo={clientConfig?.clientTheme?.customBrandingType !== 2} label={'Secured By'} />
      </Page>
    </EmailLinkConfirmContext.Provider>
  );
};

export const useEmailLinkConfirmContext = () => useContext(EmailLinkConfirmContext);
