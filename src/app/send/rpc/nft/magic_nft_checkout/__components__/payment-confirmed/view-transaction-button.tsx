import { useViewTxOnExplorer } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-block-explorer-url';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoExternalLink } from '@magiclabs/ui-components';

type Props = {
  hash: string;
  chainId: number;
};

export const ViewTranssactionButton = ({ hash, chainId }: Props) => {
  const { t } = useTranslation('send');
  const { viewTxOnExplorer } = useViewTxOnExplorer();

  return (
    <Button
      variant="text"
      label={t('View transaction')}
      size="sm"
      onPress={() =>
        viewTxOnExplorer({
          chainId,
          hash,
        })
      }
    >
      <Button.TrailingIcon width={16} height={16}>
        <IcoExternalLink width={16} height={16} />
      </Button.TrailingIcon>
    </Button>
  );
};
