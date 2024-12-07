import { formatDataField } from '@app/passport/libs/format_data_field';
import { CallEncoded, CallUnencoded } from 'magic-passport/types';
import { encodeFunctionData } from 'viem';

// Mock `encodeFunctionData` to avoid testing its actual implementation
jest.mock('viem', () => ({
  encodeFunctionData: jest.fn(),
}));

describe('formatDataField', () => {
  const mockEncodedData: CallEncoded = {
    data: '0x123456' as `0x${string}`,
    to: '0xabcdefabcdefabcdefabcdefabcdefabcdef' as `0x${string}`,
    value: BigInt(1000),
  };

  const mockUnencodedData: CallUnencoded = {
    abi: [
      /* sample ABI */
    ],
    functionName: 'mockFunction',
    args: [1, 2, 3],
    to: '0xabcdefabcdefabcdefabcdefabcdefabcdef' as `0x${string}`,
    value: BigInt(100),
  };

  it('should return call.data when it is present and of type Hex', () => {
    const result = formatDataField(mockEncodedData);
    expect(result).toBe(mockEncodedData.data);
  });

  it('should encode and return the data when data is not provided but abi, functionName, and args are present', () => {
    const mockEncodedHexData = '0xabcdef' as `0x${string}`;
    (encodeFunctionData as jest.Mock).mockReturnValue(mockEncodedHexData);

    const result = formatDataField(mockUnencodedData);

    expect(encodeFunctionData).toHaveBeenCalledWith({
      abi: mockUnencodedData.abi,
      functionName: mockUnencodedData.functionName,
      args: mockUnencodedData.args,
    });
    expect(result).toBe(mockEncodedHexData);
  });

  it('should return "0x" when neither call.data nor abi, functionName, and args are provided', () => {
    const result = formatDataField({
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef' as `0x${string}`,
    });
    expect(result).toBe('0x');
  });

  it('should return "0x" when all fields except "to" are undefined', () => {
    const result = formatDataField({
      data: undefined,
      abi: undefined,
      functionName: undefined,
      args: undefined,
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef' as `0x${string}`,
    });
    expect(result).toBe('0x');
  });

  it('should handle missing or invalid call arguments gracefully', () => {
    const result = formatDataField({
      abi: undefined,
      functionName: undefined,
      args: undefined,
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdef' as `0x${string}`,
    });
    expect(result).toBe('0x');
  });

  it('should properly handle the "to" and "value" fields', () => {
    const result = formatDataField({
      ...mockUnencodedData,
      value: BigInt(3000),
    });
    expect(result).not.toBeNull(); // We aren't testing "to" and "value" directly in the function
    expect(result).toMatch(/^0x/); // Ensure it's still a Hex string
  });
});
