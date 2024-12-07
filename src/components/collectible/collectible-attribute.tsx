import { Text } from '@magiclabs/ui-components';
import { HStack, HstackProps } from '@styled/jsx';

type Props = HstackProps & {
  name: string;
};

export const CollectibleAttirbute = ({ children, name, ...rest }: Props) => {
  return (
    <HStack
      justifyContent="space-between"
      w="full"
      paddingY={3}
      borderTopWidth={1}
      borderColor="text.tertiary/20"
      _first={{
        borderTopWidth: 0,
      }}
      {...rest}
    >
      <Text
        size="sm"
        styles={{
          fontWeight: 600,
        }}
      >
        {name}
      </Text>
      {children}
    </HStack>
  );
};
