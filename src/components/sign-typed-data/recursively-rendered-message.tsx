import { isArray, isNumber, isObject, isString } from '@lib/utils/type-utils';
import { isHexString, toUtf8String } from 'ethers';
import { EIP712TypedData } from 'eth-sig-util';
import { Box, Spacer } from '@styled/jsx';
import { token } from '@styled/tokens';
import { Text } from '@magiclabs/ui-components';

const SignatureDataContent = ({ content }: { content: string }) => {
  const contentString = content.toString();
  return (
    <Box w="full" wordBreak="break-all">
      {contentString?.startsWith('0x') ? (
        <Text.Mono size="sm" styles={{ color: token('colors.ink.50') }}>
          {content}
        </Text.Mono>
      ) : (
        <Text size="sm" styles={{ color: token('colors.ink.50') }}>
          {content}
        </Text>
      )}
      <Spacer />
    </Box>
  );
};

const SignatureDataLabel = ({ label }: { label: string }) => {
  return (
    <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
      {label}
    </Text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recursivelyDisplayDataToSign(data: any) {
  if (!data) return <SignatureDataContent content="undefined" />;

  if (isArray(data)) {
    return data.map((m: string | number | unknown) => {
      if (isString(m) || isNumber(m)) {
        return <SignatureDataContent content={m as string} key={m as string} />;
      }
      return recursivelyDisplayDataToSign(m);
    });
  }
  if (isObject(data)) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    return keys.map((key, i) => {
      if (isString(values[i]) || isNumber(values[i])) {
        return (
          <div key={key}>
            <SignatureDataLabel label={key} />
            <SignatureDataContent content={values[i] as string} />
          </div>
        );
      }
      return (
        <div key={key}>
          <SignatureDataLabel label={key} />
          {recursivelyDisplayDataToSign(data[key])}
        </div>
      );
    });
  }
  return null;
}

export const RecursivelyRenderedMessage = ({ m }: { m: string | EIP712TypedData }) => {
  if (!m) return null;
  // web3.personal.sign(msg) comes in hex-encoded, need to decode for user
  if (isHexString(m)) {
    try {
      return toUtf8String(m as string);
    } catch (e) {
      // If hex is from uint8array, the above will throw an error
      return m;
    }
  }
  if (isString(m) || isNumber(m)) return <SignatureDataContent content={m as string} />;
  return recursivelyDisplayDataToSign(m);
};
