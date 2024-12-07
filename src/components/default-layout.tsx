'use client';
import { useCustomVars } from '@magiclabs/ui-components';
import { FC, PropsWithChildren, useEffect } from 'react';

export const DefaultLayout: FC<PropsWithChildren> = ({ children }) => {
  const { setColors, setRadius } = useCustomVars({});
  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', 'dark');
    setColors('surface', '#19191A4D');
    setRadius('button', '0.875rem');
  }, []);
  return <>{children}</>;
};
