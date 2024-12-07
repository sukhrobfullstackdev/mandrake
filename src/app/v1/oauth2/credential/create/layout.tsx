import { LoginProvider } from '@app/send/login-context';
import { getServerQueryClient } from '@lib/server/query-client';
import { css } from '@styled/css';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

interface Props {
  children: React.ReactNode;
}

export default async function OAuthCredentailCreateLayout({ children }: Props) {
  const queryClient = await getServerQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LoginProvider>
        <div
          data-testid="legacy-oauth-credential-create-wrapper"
          className={css({
            height: '100vh',
            paddingTop: '7rem',
            textAlign: 'center',
            backgroundColor: 'surface.tertiary',
          })}
        >
          {children}
        </div>
      </LoginProvider>
    </HydrationBoundary>
  );
}
