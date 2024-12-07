'use client';
import { Button, Error } from '@magiclabs/ui-components';
import { useTranslation } from '@common/i18n';
import { useEffect, useState } from 'react';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getDecodedQueryParams } from '@lib/utils/query-string';
import { useStore } from '@hooks/store';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';

interface ErrorData {
  message: string;
  encodedQueryParam: string;
}

export default function ApiKeyInvalidMissingError({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [errorData, setErrorData] = useState<ErrorData>({ message: '', encodedQueryParam: '' });
  const { t } = useTranslation('send');

  useEffect(() => {
    const data: ErrorData = JSON.parse(searchParams.errorResponse as string);
    useStore.setState({ decodedQueryParams: getDecodedQueryParams(data.encodedQueryParam) });
    AtomicRpcPayloadService.setEncodedQueryParams(data.encodedQueryParam);
    setErrorData(data);
    IFrameMessageService.showOverlay();
  }, [searchParams.errorResponse]);

  const handleClose = () => {
    IFrameMessageService.hideOverlay();
  };
  return (
    <Error
      backgroundType="blurred"
      title={t('App error')}
      detailTitle={'DETAILS'}
      detailMessage={errorData.message}
      message={t("Please contact this app's developers for a resolution")}
    >
      <Error.Button>
        <Button label="Close" onPress={handleClose} />
      </Error.Button>
    </Error>
  );
}
