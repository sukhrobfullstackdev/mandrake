import { BottomSheet, BottomSheetProps } from '@app/send/rpc/nft/magic_nft_checkout/__components__/bottom-sheet';
import { useCostBreakdown } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-cost-breakdown';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { Divider, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const CostBreakdownBottomSheet = ({ isOpened, setIsOpened }: BottomSheetProps) => {
  const { t } = useTranslation('send');
  const { subtotalInUsd, networkFeeInUsd, serviceFeeInUsd, totalInUsd } = useCostBreakdown();

  return (
    <BottomSheet isOpened={isOpened} setIsOpened={setIsOpened}>
      <VStack gap={8} alignItems="flex-start">
        <VStack gap={1} alignItems="flex-start">
          <Text.H3
            styles={{
              fontWeight: 500,
            }}
          >
            {t('Cost breakdown')}
          </Text.H3>
          <Text size="md" styles={{ color: token('colors.text.secondary') }}>
            {t('The following fees apply for credit, debit, or PayPal purchases')}
          </Text>
        </VStack>

        <VStack gap={4} alignItems="flex-start" w="full" py="1">
          <HStack justifyContent="space-between" w="full">
            <Text size="lg">{t('Subtotal')}</Text>
            <Text size="lg">{subtotalInUsd}</Text>
          </HStack>
          <VStack gap={1.5} alignItems="flex-start" w="full">
            <HStack justifyContent="space-between" w="full">
              <Text size="lg">{t('Network fee')}</Text>
              <Text size="lg">{networkFeeInUsd}</Text>
            </HStack>
            <Text size="sm" styles={{ color: token('colors.text.secondary') }}>
              {t('Required gas cost for blockchain transaction')}
            </Text>
          </VStack>
          <VStack gap={1.5} alignItems="flex-start" w="full">
            <HStack justifyContent="space-between" w="full">
              <Text size="lg">{t('Service fee')}</Text>
              <Text size="lg">{serviceFeeInUsd}</Text>
            </HStack>
            <Text size="sm" styles={{ color: token('colors.text.secondary') }}>
              {t('Payment processing and wallet services')}
            </Text>
          </VStack>

          <Divider w="full" color="surface.tertiary" />

          <HStack justifyContent="space-between" w="full">
            <Text size="lg">{t('Total')}</Text>
            <Text
              size="lg"
              styles={{
                fontWeight: 500,
              }}
            >
              {totalInUsd}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </BottomSheet>
  );
};
