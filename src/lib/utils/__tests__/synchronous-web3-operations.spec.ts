import { personalSign } from '../synchronous-web3-operations';
import sigUtil from 'eth-sig-util';

const EMPTY_SIGNATURE = '0x0';

jest.mock('eth-sig-util', () => ({
  __esModule: true,
  default: {
    personalSign: jest.fn(),
  },
}));

describe('personalSign', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sign successfully with a valid private key', () => {
    const message = 'Test message';
    const privateKey = '0x'.padEnd(66, 'a');
    const mockSignature = '0x1234';

    (sigUtil.personalSign as jest.Mock).mockReturnValue(mockSignature);

    const result = personalSign(message, privateKey);

    expect(result).toBe(mockSignature);
    expect(sigUtil.personalSign).toHaveBeenCalledWith(Buffer.from(privateKey.substring(2), 'hex'), { data: message });
  });

  it('should return EMPTY_SIGNATURE when privateKey is null', () => {
    const message = 'Test message';

    const result = personalSign(message, null);

    expect(result).toBe(EMPTY_SIGNATURE);
    expect(sigUtil.personalSign).not.toHaveBeenCalled();
  });

  it('should retry signing if privateKey length is 88', () => {
    const message = 'Test message';
    const privateKey = '0x'.padEnd(90, 'a');
    const mockSignature = '0x1234';

    (sigUtil.personalSign as jest.Mock).mockReturnValue(mockSignature);

    const result = personalSign(message, privateKey);

    expect(result).toBe(mockSignature);
    expect(sigUtil.personalSign).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if signing fails', () => {
    const message = 'Test message';
    const privateKey = '0x'.padEnd(66, 'a');
    const mockError = new Error('Signing failed');

    (sigUtil.personalSign as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    expect(() => personalSign(message, privateKey)).toThrow(mockError);
  });
});
