import { Box } from '@styled/jsx';

export default function UserProfileGradient() {
  return (
    <Box
      h={'2.5rem'}
      w={'2.5rem'}
      borderRadius={'50%'}
      background={
        'radial-gradient(235.12% 133.33% at 50% 106.25%, #FFF507 1%, #F09BEB 25.94%, #412CB9 59.82%, #18171A 100%)'
      }
    />
  );
}
