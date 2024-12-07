import VerifyLoginResultPage from '@app/oauth2/popup/verify/page';
import { render } from '@testing-library/react';

const mockPostMessage = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockImplementation(() => ({
    toString: jest.fn(
      () =>
        'state=ggg999&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none',
    ),
  })),
}));

jest.mock('@lib/common/popup', () => ({
  postPopupMessage: jest.fn().mockImplementation(args => mockPostMessage(args)),
}));

const setup = () => {
  return render(<VerifyLoginResultPage />);
};

describe('Verify OAuth login result', () => {
  it('should post message with authorizationResponseParams', () => {
    global.close = jest.fn();
    setup();
    expect(mockPostMessage).toHaveBeenCalledWith({
      method: 'magic_popup_oauth_verify_response',
      payload: {
        authorizationResponseParams:
          'state=ggg999&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none',
      },
    });
  });
});
