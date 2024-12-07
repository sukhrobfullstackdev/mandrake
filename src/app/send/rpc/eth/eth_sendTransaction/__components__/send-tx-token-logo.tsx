'use client';

import { useChainInfo } from '@hooks/common/chain-info';
import { IconGenericToken, LogoEthereum } from '@magiclabs/ui-components';
interface TokenLogoProps {
  size?: number;
  isErc20Token?: boolean;
}

export default function SendTxTokenLogo({ size = 45, isErc20Token = false }: TokenLogoProps) {
  const { chainInfo } = useChainInfo();
  if (!chainInfo) return null;
  const BlockchainLogo = (chainInfo?.tokenIcon as React.FC<{ width: number; height: number }>) || LogoEthereum;
  return isErc20Token ? <IconGenericToken height={size} width={size} /> : <BlockchainLogo width={size} height={size} />;
}
