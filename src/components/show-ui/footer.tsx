import { useCustomBrandingType } from '@hooks/common/client-config';
import { getFooterLabel, useLocale } from '@hooks/common/locale';
import { Page } from '@magiclabs/ui-components';

export default function PageFooter() {
  const locale = useLocale();
  const customBrandingType = useCustomBrandingType();
  return <Page.Footer showLogo={customBrandingType !== 2} label={getFooterLabel(locale)} />;
}
