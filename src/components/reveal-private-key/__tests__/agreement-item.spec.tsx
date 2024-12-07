import AgreementItem from '@components/reveal-private-key/agreement-item';
import { magicTermsOfServiceUrl } from '@constants/privacy-and-tos-urls';
import { T } from '@lib/common/i18n';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import Link from 'next/link';

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AgreementItem isChecked={false} setIsChecked={() => {}}>
        <T
          ns="send"
          translate={
            'You have read and agreed to <termsOfService/>, including the risks related to owning your private key disclosed in the Terms of Service.'
          }
        >
          <Link href={magicTermsOfServiceUrl} id="termsOfService">
            Magic&apos;s Terms of Service
          </Link>
        </T>
      </AgreementItem>
    </QueryClientProvider>,
  );
}

describe('AgreementItem', () => {
  beforeEach(() => {
    setup();
  });

  it('renders a link correctly', () => {
    const linkElement = screen.getByRole('link', { name: /Magic's Terms of Service/i });

    expect(linkElement).toHaveAttribute('href', magicTermsOfServiceUrl);
  });
});
