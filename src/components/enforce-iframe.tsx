import { isIframe } from '@lib/utils/context';
import React from 'react';

interface EnforceIframeProps {
  children?: React.ReactNode;
}
// TODO: Implement the "not found" view
export const EnforceIframe = ({ children }: EnforceIframeProps) => {
  return isIframe ? <>{children}</> : <div style={{ color: 'white' }}>Not found</div>;
};
