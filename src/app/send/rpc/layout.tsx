/* istanbul ignore file */
'use client';

import { Overlay } from '@magiclabs/ui-components';

export interface Props {
  children: React.ReactNode;
}

export default function RpcLayout({ children }: Props) {
  return <Overlay backgroundType="blurred">{children}</Overlay>;
}
