import { useThemeRadii } from '@hooks/common/client-config';

export const usePaypalButtonShape = () => {
  const { buttonRadius } = useThemeRadii();
  if (!buttonRadius) return 'pill';
  const radius = parseInt(buttonRadius, 10);
  return radius > 16 ? 'pill' : 'rect';
};
