import CreatePassportButton from '@app/passport/rpc/user/components/create-passport-button';
import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@http-services', () => ({
  Magic: {
    Post: jest.fn(),
  },
}));

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    replace: mockReplace,
  }),
}));

interface Params {
  existingCredentialId?: string | null;
  isUserVerifyingPlatformAuthenticatorAvailable?: boolean;
  isConditionalMediationAvailable?: boolean;
}
function executeRequest({
  existingCredentialId,
  isUserVerifyingPlatformAuthenticatorAvailable = true,
  isConditionalMediationAvailable = true,
}: Params) {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: '1',
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  (global.window as any).PublicKeyCredential = {
    isUserVerifyingPlatformAuthenticatorAvailable: jest
      .fn()
      .mockResolvedValue(isUserVerifyingPlatformAuthenticatorAvailable),
    isConditionalMediationAvailable: jest.fn().mockResolvedValue(isConditionalMediationAvailable),
  };

  if (existingCredentialId) {
    usePassportStore.setState({ existingPasskeyCredentialId: existingCredentialId });
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <CreatePassportButton />
    </QueryClientProvider>,
  );
}

describe('create passport button', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('handlePasskeyLogin navigates to passkey_sign_up when existing credential is present', async () => {
    await act(async () => {
      await executeRequest({ existingCredentialId: 'iasdf124' });
    });

    act(() => screen.getByText('Create Passport').click());
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/passkey_sign_up');
  });

  it('handlePasskeyLogin navigates to passkey_sign_up when no existing credential is present', async () => {
    await act(async () => {
      await executeRequest({ existingCredentialId: null });
    });

    act(() => screen.getByText('Create Passport').click());
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/passkey_sign_up');
  });
});
