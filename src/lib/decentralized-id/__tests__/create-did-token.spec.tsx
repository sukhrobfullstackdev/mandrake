import { DidTokenClaim, createDIDToken, personalSign } from '@lib/decentralized-id/create-did-token';
import { decodeBase64 } from '@utils/base64';

const mockPublicAddress = '0x3750B8eF5AB747D986B935d6316d7E76059dD4Ee';
const mockRawPrivateKey = '0x13d76043e5771a944cbad9092d1d009e078dd8dd05cd4318953327a5a52d683b';

jest.mock('@utils/web3-services/web3-service', () => ({
  register: jest.fn(),
  createEthWallet: jest.fn(),
  personalSign: jest.fn().mockImplementation(() => {
    return new Promise<string>(resolve => {
      resolve(
        '0x6f1236acee59ac5c990a97e2f6eca1542d938d456c560ee8dd398018da5620aa41506875243b1797e279c30acbecf4988f042ab6c3afa3ba39908b453562c4741b',
      );
    });
  }),
  toChecksumAddress: jest.fn(),
}));

describe('@lib/decentralized-id/create-did-token', () => {
  it('personalSign with valid pk provided should successfully execute the signature', async () => {
    const result = await personalSign('troll goat', mockRawPrivateKey);

    expect(result).toEqual(
      '0x6f1236acee59ac5c990a97e2f6eca1542d938d456c560ee8dd398018da5620aa41506875243b1797e279c30acbecf4988f042ab6c3afa3ba39908b453562c4741b',
    );
  });

  it('createDIDToken with valid pk and no attachment should successfully execute the signature', async () => {
    const options = {
      account: { address: mockPublicAddress, privateKey: mockRawPrivateKey },
      subject: '',
      audience: '',
      lifespan: 0,
    };

    const result = await createDIDToken(options);
    const resultDecoded = JSON.parse(decodeBase64(result));

    const decodedClaim = JSON.parse(resultDecoded[1]) as DidTokenClaim;

    expect(decodedClaim.iss).toEqual('did:ethr:0x3750B8eF5AB747D986B935d6316d7E76059dD4Ee');
  });

  it('createDIDToken with valid pk and attachment should successfully execute the signature', async () => {
    const options = {
      account: { address: mockPublicAddress, privateKey: mockRawPrivateKey },
      subject: '',
      audience: '',
      lifespan: 0,
      add: 'nonce',
    };

    const result = await createDIDToken(options);
    const resultDecoded = JSON.parse(decodeBase64(result));

    const decodedClaim = JSON.parse(resultDecoded[1]) as DidTokenClaim;

    expect(decodedClaim.iss).toEqual('did:ethr:0x3750B8eF5AB747D986B935d6316d7E76059dD4Ee');
    expect(decodedClaim.add).toEqual(
      '0x6f1236acee59ac5c990a97e2f6eca1542d938d456c560ee8dd398018da5620aa41506875243b1797e279c30acbecf4988f042ab6c3afa3ba39908b453562c4741b',
    );
  });
});
