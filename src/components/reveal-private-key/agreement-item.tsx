import { Checkbox, Text } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { ReactNode } from 'react';

interface AgreementItemProps {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  children: ReactNode | string;
}

const AgreementItem = ({ isChecked, setIsChecked, children }: AgreementItemProps) => {
  return (
    <HStack gap={4} alignItems="flex-start">
      <Box mt={1}>
        <Checkbox checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
      </Box>
      <Text size="sm">{children}</Text>
    </HStack>
  );
};

export default AgreementItem;
