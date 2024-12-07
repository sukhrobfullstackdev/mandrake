/* istanbul ignore file */
'use client';

import { useNewTabContext } from '@components/new-tab/new-tab-context';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { useCustomVars } from '@magiclabs/ui-components';
import { useEffect } from 'react';

interface ContainerProps {
  children?: React.ReactNode;
}

export default function NewTabContainer({ children }: ContainerProps) {
  const { magicApiKey } = useStore(state => state);
  const { setColors, setRadius } = useCustomVars({});
  const newTabContext = useNewTabContext();

  const { data: clientConfig, isError } = useClientConfigQuery(
    {
      magicApiKey: magicApiKey || '',
    },
    { enabled: !!magicApiKey },
  );

  useEffect(() => {
    if (clientConfig) {
      const colorMode = clientConfig?.clientTheme.themeColor === 'dark' ? 'dark' : 'light';
      const { textColor, buttonColor, buttonRadius, containerRadius, backgroundColor, neutralColor } =
        clientConfig.clientTheme;
      document.documentElement.setAttribute('data-color-mode', colorMode);
      if (textColor) setColors('text', textColor);
      if (buttonRadius) setRadius('button', buttonRadius);
      if (containerRadius) setRadius('container', containerRadius);
      if (backgroundColor) setColors('surface', backgroundColor);
      if (neutralColor) setColors('neutral', neutralColor);
      if (buttonColor) setColors('brand', buttonColor);

      newTabContext.setNewTabState({ isThemeLoaded: true });
    }
    if (isError) {
      newTabContext.setNewTabState({ isThemeLoaded: true });
    }
  }, [clientConfig, isError]);

  return <>{children}</>;
}
