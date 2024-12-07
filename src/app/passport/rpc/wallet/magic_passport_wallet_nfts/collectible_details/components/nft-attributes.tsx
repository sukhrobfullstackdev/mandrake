import { usePassportStore } from '@hooks/data/passport/store';
import { useTranslation } from '@lib/common/i18n';
import truncateAddress from '@lib/utils/truncate-address';
import { IcoCaretDown, IcoExternalLink, LogoEthereum, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, HStack, Stack } from '@styled/jsx';
import { hstack } from '@styled/patterns';
import { token } from '@styled/tokens';
import { Network } from 'magic-passport/types';
import { useState } from 'react';

export interface NFTAttributesProps {
  contractAddress: string;
  networkName: string;
  quantity?: number;
  ownedTimestamp?: string;
  attributes?: Array<{ traitType: string; value: string }>;
}

export default function NFTAttributes({
  contractAddress,
  networkName,
  quantity,
  ownedTimestamp,
  attributes,
}: NFTAttributesProps) {
  const { t } = useTranslation('passport');
  const [isExpanded, setIsExpanded] = useState(false);
  const aquiredDate = ownedTimestamp && new Date(ownedTimestamp).toLocaleDateString();
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const contractAddressUrl = `${network.blockExplorers?.default.url}/address/${contractAddress}`;

  return (
    <Stack gap={3}>
      {quantity && quantity > 1 && (
        <>
          <HStack justify="space-between">
            <Text size="sm" fontColor="text.secondary" fontWeight="medium">
              {t('Quantity')}
            </Text>
            <Text size="sm">{quantity}</Text>
          </HStack>
          <Divider color="surface.quaternary" />
        </>
      )}

      {!!attributes && attributes.length > 0 && (
        <>
          <HStack justify="space-between">
            <Text size="sm" fontColor="text.secondary" fontWeight="medium">
              {t('Properties')}
            </Text>
            <HStack gap={2}>
              <Text size="sm">4</Text>
              <IcoCaretDown
                width={16}
                height={16}
                color={token('colors.text.tertiary')}
                className={css({
                  cursor: 'pointer',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                })}
                onClick={() => setIsExpanded(prev => !prev)}
              />
            </HStack>
          </HStack>
          {isExpanded && (
            <Stack gap={2}>
              {attributes.map(({ traitType, value }) => (
                <HStack key={traitType} justify="space-between" gap={4}>
                  <Text size="sm" fontColor="text.secondary" truncate>
                    {traitType}
                  </Text>
                  <Text size="sm" fontColor="text.secondary" truncate>
                    {value}
                  </Text>
                </HStack>
              ))}
            </Stack>
          )}
          <Divider color="surface.quaternary" />
        </>
      )}
      {aquiredDate && (
        <HStack justify="space-between">
          <Text size="sm" fontColor="text.secondary" fontWeight="medium">
            {t('Owned since')}
          </Text>
          <Text size="sm">{aquiredDate}</Text>
        </HStack>
      )}

      <Divider color="surface.quaternary" />

      <HStack justify="space-between">
        <Text size="sm" fontColor="text.secondary" fontWeight="medium">
          {t('Blockchain')}
        </Text>
        <HStack gap={2}>
          <Text size="sm">{networkName}</Text>
          <LogoEthereum width={20} height={20} />
        </HStack>
      </HStack>

      <Divider color="surface.quaternary" />

      <HStack justify="space-between">
        <Text size="sm" fontColor="text.secondary" fontWeight="medium">
          {t('Contract')}
        </Text>
        <a href={contractAddressUrl} target="_blank" rel="noreferrer" className={hstack({ gap: 2 })}>
          <Text size="sm" variant="info" fontWeight="medium">
            {truncateAddress(contractAddress)}
          </Text>
          <IcoExternalLink width={16} height={16} color={token('colors.brand.base')} />
        </a>
      </HStack>
    </Stack>
  );
}
