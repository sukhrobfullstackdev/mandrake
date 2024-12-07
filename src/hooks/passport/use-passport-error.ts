import { PassportPageErrorCodes, PassportPageErrors } from '@constants/passport-page-errors';
import { useTranslation } from '@lib/common/i18n';

export const usePassportPageError = (errorCode: PassportPageErrorCodes) => {
  const { t } = useTranslation('passport');
  const { t: tCommon } = useTranslation('common');
  const error = PassportPageErrors[errorCode];
  const headingInner = error?.heading ? t(error.heading) : tCommon('Something Went Wrong');
  const bodyInner = error?.body
    ? t(error.body)
    : `${t('Please refresh your browser and try again. If the problem persists, contact this app for help.')}`;

  return {
    heading: headingInner,
    body: bodyInner,
  };
};
