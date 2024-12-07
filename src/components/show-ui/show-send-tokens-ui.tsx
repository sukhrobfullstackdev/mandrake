import TokenList from '@components/show-ui/token-list';
import { useTranslation } from '@lib/common/i18n';
import { Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

const ShowSendTokensUI = () => {
  const { t } = useTranslation('send');
  return (
    <Page.Content>
      <VStack w="full" alignItems="flex-start" gap={4} my={2}>
        <Text size="sm" styles={{ fontWeight: 600 }}>
          {t('Choose a token')}
        </Text>
        <TokenList isSendTokensPage />
      </VStack>
    </Page.Content>
  );
};

export default ShowSendTokensUI;
