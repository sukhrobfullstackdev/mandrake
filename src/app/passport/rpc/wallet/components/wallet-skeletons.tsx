/* istanbul ignore file */

import { Skeleton } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const TokenListItemSkeleton = () => {
  const backgroundColor = token('colors.surface.secondary');

  return (
    <HStack w="full" h={12} justify="space-between">
      <HStack gap={4}>
        <Skeleton width={40} height={40} borderRadius={50} backgroundColor={backgroundColor} />
        <Skeleton width={120} height={24} backgroundColor={backgroundColor} />
      </HStack>
      <Skeleton width={75} height={24} backgroundColor={backgroundColor} />
    </HStack>
  );
};
