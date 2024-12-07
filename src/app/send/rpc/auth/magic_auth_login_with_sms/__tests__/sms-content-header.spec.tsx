import { render, screen } from '@testing-library/react';

import { StoreState, useStore } from '@hooks/store';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import SmsContentHeader from '../__components__/sms-content-header';

const mockPhoneNumber = '+1 432 675 0098';
const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = (state: Partial<StoreState>, phoneNumber: string) => {
  useStore.setState(state);

  return render(<SmsContentHeader phoneNumber={phoneNumber} />);
};

describe('SMS Header Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /start route when session hydration fails', async () => {
    await setup(mockState, mockPhoneNumber);
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_sms',
      id: '1',
      params: [{ phoneNumber: '+14326750098' }],
    });

    expect(screen.getByText(mockPhoneNumber)).toBeInTheDocument();
  });
});
