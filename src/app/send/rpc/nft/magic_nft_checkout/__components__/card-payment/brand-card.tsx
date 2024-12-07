import { SwitchCase } from '@app/send/rpc/nft/magic_nft_checkout/__components__/switch-case';
import { CARD_TYPES } from '@constants/card-types';
import { IcoCreditCard, PayAmex, PayDiscover, PayMastercard, PayVisa } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

type Props = {
  type?: string | null;
};

export const BrandCard = ({ type }: Props) => {
  return (
    <SwitchCase
      value={type ?? 'default'}
      caseBy={{
        [CARD_TYPES.VISA]: <PayVisa />,
        [CARD_TYPES.MAESTRO]: <PayMastercard />,
        [CARD_TYPES.DISCOVER]: <PayDiscover />,
        [CARD_TYPES.AMERICAN_EXPRESS]: <PayAmex />,
      }}
      defaultComponent={<IcoCreditCard color={token('colors.text.tertiary')} />}
    />
  );
};
