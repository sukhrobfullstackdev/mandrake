import { SignTypedDataPage } from '@components/sign-typed-data/sign-typed-data-page';
import { useAppName, useAssetUri } from '@hooks/common/client-config';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Mock the hooks
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/data/embedded/ethereum-proxy', () => ({
  useCustomNodeEthProxyQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn(),
  })),
  useMagicApiEthProxyQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn(),
  })),
}));
jest.mock('@lib/common/i18n', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@hooks/common/client-config', () => ({
  useAppName: jest.fn(),
  useAssetUri: jest.fn(),
  useCustomBrandingType: jest.fn(),
  useColorMode: jest.fn(),
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn(() => ({
    chainInfo: {
      currency: 'ETH',
    },
  })),
}));

function setup(mockOnConfirm: () => void, mockOnClose: () => void, mockIsLoading: boolean) {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'eth_signTypedData_v4',
    id: 'my_id',
    params: ['0x123', '0x456'],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <SignTypedDataPage
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        isLoading={mockIsLoading}
        message='{"key":"test-message"}'
      />
    </QueryClientProvider>,
  );
}

describe('SignTypedDataPage', () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();
  const mockAppName = 'Test App';
  const mockAssetUri = 'test-asset-uri';
  const mockT = (key: string) => key;

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useAppName as jest.Mock).mockReturnValue(mockAppName);
    (useAssetUri as jest.Mock).mockReturnValue(mockAssetUri);

    useStore.setState({ decodedQueryParams: { domainOrigin: 'test-domain' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', async () => {
    await act(async () => {
      await setup(mockOnConfirm, mockOnClose, false);
    });
    expect(screen.getByText('Confirm Request')).toBeInTheDocument();
    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('test-domain')).toBeInTheDocument();
    expect(screen.getByText('test-message')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('calls onClose when the cancel button is clicked', async () => {
    await act(async () => {
      await setup(mockOnConfirm, mockOnClose, false);
    });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onConfirm when the sign button is clicked', async () => {
    await act(async () => {
      await setup(mockOnConfirm, mockOnClose, false);
    });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Confirm'));
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('disables the sign button when isLoading is true', async () => {
    await act(async () => {
      await setup(mockOnConfirm, mockOnClose, true);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign/i })).toBeDisabled();
    });
  });

  it('parses message if it is a JSON string', async () => {
    await act(async () => {
      await setup(mockOnConfirm, mockOnClose, false);
    });
    await waitFor(() => {
      expect(screen.getByText('key')).toBeInTheDocument();
      expect(screen.getByText('test-message')).toBeInTheDocument();
    });
  });
});
