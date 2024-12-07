import MenuFooter from '@app/passport/rpc/user/components/header/menu-footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { rejectPopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportStore } from '@hooks/data/passport/store';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('@hooks/common/popup/popup-json-rpc-request', () => ({
  rejectPopupRequest: jest.fn(() => jest.fn()),
}));

describe('MenuFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the logout text correctly', () => {
    render(<MenuFooter />);
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('handles logout correctly when clicked', async () => {
    render(<MenuFooter />);

    usePassportStore.setState({
      refreshToken: 'refreshToken',
      accessToken: 'accessToken',
      eoaPublicAddress: 'eoaPublicAddress',
      existingPasskeyCredentialIds: ['existingPasskeyCredentialId'],
    });

    const logoutButton = screen.getByRole('button');

    await act(() => {
      fireEvent.click(logoutButton);
    });

    const { refreshToken, accessToken, eoaPublicAddress, existingPasskeyCredentialIds } = usePassportStore.getState();

    expect(refreshToken).toBe(null);
    expect(accessToken).toBe(null);
    expect(eoaPublicAddress).toBe(null);
    expect(existingPasskeyCredentialIds[0]).toBe('existingPasskeyCredentialId');

    expect(rejectPopupRequest).toHaveBeenCalledWith(
      RpcErrorCode.SessionTerminated,
      RpcErrorMessage.UserTerminatedSession,
    );
  });
});
