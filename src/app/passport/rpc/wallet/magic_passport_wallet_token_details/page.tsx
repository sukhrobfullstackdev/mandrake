'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import {
  PassportPage,
  WalletPage,
  WalletActions,
  IcoWallet,
  IcoSwap,
  IcoPaperPlane,
  Text,
  LogoEthereumCircleMono,
} from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { useTranslation } from '@common/i18n';

export default function PassportTokenDetailsPage() {
  const router = usePassportRouter();
  const { t } = useTranslation('passport');

  return (
    <WalletPage.Content>
      <PassportPage onBack={() => router.replace('/passport/rpc/wallet/magic_passport_wallet')}>
        <PassportPage.Title title="Ethereum" />
        <PassportPage.Content>
          <VStack w="full" px={4}>
            <VStack w="full" borderBottomWidth="thin" borderColor="text.tertiary/20" py={6}>
              <HStack mb={4} w="full" justifyContent="space-between">
                <VStack alignItems="flex-start">
                  <Text fontColor={'text.secondary'}>ETH Price</Text>
                  <Text.H4>$2,543.52</Text.H4>
                </VStack>
                <LogoEthereumCircleMono height={48} width={48} />
              </HStack>
              <VStack mt={14} mb={24}>
                <Text fontColor={'text.secondary'}>TODO: Chart</Text>
              </VStack>
              <HStack mb={1} w="full" justifyContent="space-between">
                <Text fontColor={'text.secondary'}>{t('Balance')}</Text>
                <HStack>
                  <Text fontColor={'text.secondary'}>.185 ETH</Text>
                  <Text fontWeight="semibold">$242.73</Text>
                </HStack>
              </HStack>
              <HStack w="full" justifyContent="space-between">
                <WalletActions.Action actionBox={true} onPress={() => 'todo'} label={t('Buy')}>
                  <IcoWallet />
                </WalletActions.Action>
                <WalletActions.Action actionBox={true} onPress={() => 'todo'} label={t('Swap')}>
                  <IcoSwap />
                </WalletActions.Action>
                <WalletActions.Action actionBox={true} onPress={() => 'todo'} label={t('Send')}>
                  <IcoPaperPlane />
                </WalletActions.Action>
              </HStack>
            </VStack>
            <VStack w="full" alignItems="flex-start" mt={2}>
              <Text.H3>{t('Activity')}</Text.H3>
              <Text fontColor={'text.secondary'}>TODO: activity list</Text>
            </VStack>
          </VStack>
        </PassportPage.Content>
      </PassportPage>
    </WalletPage.Content>
  );
}
