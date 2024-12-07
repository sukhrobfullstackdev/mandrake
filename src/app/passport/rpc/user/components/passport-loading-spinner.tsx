import { AnimatedSpinner, Text } from '@magiclabs/ui-components';
import { Center, Spacer } from '@styled/jsx';

export default function PassportLoadingSpinner({ text }: { text?: string }) {
  return (
    <>
      <Center mt="25vh">
        <AnimatedSpinner />
      </Center>
      {text && (
        <>
          <Spacer mt={2} />
          <Text size="sm" styles={{ textAlign: 'center' }}>
            {text}
          </Text>{' '}
        </>
      )}
    </>
  );
}
