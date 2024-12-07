import { IcoCheckmarkCircleFill, IcoDismissCircleFill, LoadingSpinner } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

interface StatusIconProps {
  isPending: boolean;
  isConfirming?: boolean;
  isError: boolean;
}

const StatusIcon = ({ isPending, isConfirming, isError }: StatusIconProps) => {
  if (isError) {
    return <IcoDismissCircleFill width={40} height={40} color={token('colors.negative.base')} />;
  }

  if (isPending || isConfirming) {
    return <LoadingSpinner size={40} strokeWidth={5} />;
  }

  return <IcoCheckmarkCircleFill width={40} height={40} color={token('colors.brand.base')} />;
};

export default StatusIcon;
