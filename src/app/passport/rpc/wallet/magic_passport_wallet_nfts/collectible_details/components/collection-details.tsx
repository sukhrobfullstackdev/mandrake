import { useTranslation } from '@lib/common/i18n';
import { Button, IcoGlobe, LogoDiscordMono, LogoTwitterMono, Text } from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import Image from 'next/image';
import { useState } from 'react';

export type LinkDetail = {
  url?: string;
  type: 'website' | 'twitter' | 'discord';
};

type CollectionDetailsProps = {
  name: string;
  description: string;
  collectionLogoSrc: string;
  linkUrls?: LinkDetail[];
};

const iconMap = {
  website: <IcoGlobe />,
  twitter: <LogoTwitterMono />,
  discord: <LogoDiscordMono />,
};

export default function CollectionDetails({ name, description, collectionLogoSrc, linkUrls }: CollectionDetailsProps) {
  const { t } = useTranslation('passport');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Stack gap={4}>
      <Stack gap={3}>
        {collectionLogoSrc && <Image src={collectionLogoSrc} alt={`${name} logo`} height={40} width={40} />}
        <Stack gap={2}>
          <Text.H4>{name}</Text.H4>
          {description && (
            <Box>
              <Text inline size="sm" fontColor="text.secondary">
                {isExpanded ? description : `${description.slice(0, 120)}...`}
              </Text>
              {!isExpanded && description.length && (
                <Box display="inline" pl={2}>
                  <Button variant="text" size="sm" label={t('Read more')} onPress={() => setIsExpanded(true)} />
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Stack>

      {linkUrls && linkUrls?.length > 0 && (
        <HStack gap={4}>
          {linkUrls.map(({ url, type }) => (
            <Button
              size="sm"
              variant="neutral"
              key={url}
              onPress={() => window.open(url, '_blank', 'noopener noreferrer')}
            >
              <Button.LeadingIcon>{iconMap[type]}</Button.LeadingIcon>
            </Button>
          ))}
        </HStack>
      )}
    </Stack>
  );
}
