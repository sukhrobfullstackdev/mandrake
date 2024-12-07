import { IcoExternalLink, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

interface MenuItemProps {
  icon: JSX.Element;
  text: string;
  includeExternalLink?: boolean;
  textColor?: string;
  mb?: string | number;
  tooltip?: boolean;
}

export default function MenuItem({
  icon,
  text,
  includeExternalLink = false,
  textColor = '',
  mb = '1.2rem',
  tooltip = false,
}: MenuItemProps) {
  return (
    <HStack mb={mb} cursor={'pointer'} w={'fit-content'}>
      {tooltip ? (
        <Tooltip placement="top" width="max-content" content={'Coming soon'}>
          <HStack opacity={'0.3'}>
            {icon}
            <Text styles={{ color: textColor, fontWeight: '500' }}>{text}</Text>
            {includeExternalLink ? (
              <IcoExternalLink color={token('colors.text.tertiary')} height={14} width={14} />
            ) : null}
          </HStack>
        </Tooltip>
      ) : (
        <>
          {icon}
          <Text styles={{ color: textColor, fontWeight: '500' }}>{text}</Text>
          {includeExternalLink ? (
            <IcoExternalLink color={token('colors.text.tertiary')} height={14} width={14} />
          ) : null}
        </>
      )}
    </HStack>
  );
}
