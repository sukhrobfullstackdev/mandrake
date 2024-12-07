'use client';

import {
  WCSVGWCCopiedIcon,
  WCSVGWCCopyIcon,
  WCSVGWCHideIcon,
  WCSVGWCRevealIcon,
} from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__assets__';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { css, cx } from '@styled/css';
import { center } from '@styled/patterns';

interface CopyCredentialsButtonProps {
  wasCopied: boolean;
  onPress: () => void;
}

interface ShowCredentialsButtonProps {
  isHidden: boolean;
  onPress: () => void;
}

const buttonBaseStyles = center({
  gap: 1,
  w: 'full',
  h: '3.25rem',
  p: 4,
  rounded: '1.625rem',
  cursor: 'pointer',
});

const copyButtonColors = {
  text: '#949E9E',
  base: '#FFFFFF08',
  hover: '#FFFFFF0F',
  active: '#FFFFFF17',
};

const revealButtonColors = {
  hidden: {
    text: '#FFA64C',
    base: '#FFA64C1A',
    hover: '#FFA64C26',
    active: '#FFA64C33',
  },
  revealed: {
    text: '#47A1FF',
    base: '#47A1FF1A',
    hover: '#47A1FF26',
    active: '#47A1FF33',
  },
};

export const CopyCredentialsButton = ({ wasCopied, onPress }: CopyCredentialsButtonProps) => {
  const { t } = useTranslation('send');
  const label = wasCopied ? 'Copied' : 'Copy';
  const copyIcon = wasCopied ? <WCSVGWCCopiedIcon /> : <WCSVGWCCopyIcon />;

  return (
    <button
      className={cx(
        buttonBaseStyles,
        css({
          bg: copyButtonColors.base,
          borderColor: copyButtonColors.base,
          borderWidth: 'thin',
          _hover: { bg: copyButtonColors.hover, borderColor: copyButtonColors.hover },
          _active: { bg: copyButtonColors.active, borderColor: copyButtonColors.active },
        }),
      )}
      onClick={onPress}
      aria-label="Copy credentials to clipboard"
    >
      {copyIcon}
      <Text styles={{ fontWeight: 600, color: copyButtonColors.text }}>{t(label)}</Text>
    </button>
  );
};

export const ShowCredentialsButton = ({ isHidden, onPress }: ShowCredentialsButtonProps) => {
  const { t } = useTranslation('send');
  const label = isHidden ? 'Reveal' : 'Hide';
  const revealIcon = isHidden ? <WCSVGWCHideIcon /> : <WCSVGWCRevealIcon />;

  return (
    <button
      className={cx(
        buttonBaseStyles,
        css({
          bg: isHidden ? revealButtonColors.hidden.base : revealButtonColors.revealed.base,
          borderColor: isHidden ? revealButtonColors.hidden.base : revealButtonColors.revealed.base,
          borderWidth: 'thin',
          _hover: isHidden
            ? { bg: revealButtonColors.hidden.hover, borderColor: revealButtonColors.hidden.hover }
            : { bg: revealButtonColors.revealed.hover, borderColor: revealButtonColors.revealed.hover },
          _active: isHidden
            ? { bg: revealButtonColors.hidden.active, borderColor: revealButtonColors.hidden.active }
            : { bg: revealButtonColors.revealed.active, borderColor: revealButtonColors.revealed.active },
        }),
      )}
      onClick={onPress}
      aria-label={`${label} credentials`}
    >
      {revealIcon}
      <Text
        styles={{
          fontWeight: 600,
          color: isHidden ? revealButtonColors.hidden.text : revealButtonColors.revealed.text,
        }}
      >
        {t(label)}
      </Text>
    </button>
  );
};
