import { LoadingSpinner, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';

interface DisplayPrivateKeyProps {
  rawPrivateCredentials: string;
  isHidden: boolean;
  isLoading: boolean;
}

const DisplayPrivateKey = ({ rawPrivateCredentials, isHidden, isLoading }: DisplayPrivateKeyProps) => {
  const wordBreakSetting = rawPrivateCredentials.includes(' ') ? 'normal' : 'break-all';

  if (isLoading) {
    return (
      <Box mb={2}>
        <LoadingSpinner size={48} />
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="thin" borderColor="neutral.secondary" rounded="xl" wordBreak={wordBreakSetting}>
      <Box filter={isHidden ? 'blur(8px)' : ''}>
        <Text.Mono>{rawPrivateCredentials}</Text.Mono>
      </Box>
    </Box>
  );
};

export default DisplayPrivateKey;
