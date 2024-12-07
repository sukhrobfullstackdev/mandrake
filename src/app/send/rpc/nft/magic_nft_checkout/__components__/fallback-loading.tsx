import { LoadingSpinner } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

export const FallbackLoading = () => {
  return (
    <VStack my={28}>
      <LoadingSpinner />
    </VStack>
  );
};
