import { LoginMethodType } from '@custom-types/api-response';
import { UserInfo } from '@custom-types/user';

export const mockUser1: UserInfo = {
  authUserId: 'mockAuthUserId1',
  authUserWalletId: 'mockWalletId1',
  consent: { email: true },
  authUserMfaActive: false,
  utcTimestampMs: 1234567890,
  clientId: 'abcc123',
  publicAddress: '0x1234567890abcdef',
  challengeMessage: 'Hello, world!',
  login: {
    type: LoginMethodType.EmailLink,
    oauth2: 'google',
    webauthn: {
      devicesInfo: [],
      username: 'freeguy',
    },
  },
  recoveryFactors: [],
};
