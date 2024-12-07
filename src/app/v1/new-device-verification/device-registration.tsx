import { useTranslation } from '@common/i18n';
import { DeviceVerificationStatus } from '@custom-types/new-device-verification';
import { useAssetUri } from '@hooks/common/client-config';
import { useDeviceApproveQuery, useDeviceCheckQuery } from '@hooks/data/embedded/device-verification';
import { marshallDeviceVerificationQueryParams } from '@lib/device-verification/marshalParams';
import { Button, ClientAssetLogo, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, VStack } from '@styled/jsx';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';

export const DeviceRegistration: React.FC<{
  setVerificationStatus: (status: DeviceVerificationStatus) => void;
}> = ({ setVerificationStatus }) => {
  const searchParams = useSearchParams();
  const { t } = useTranslation('send');
  const assetUri = useAssetUri();
  const { deviceToken, expiryTimestamp, metadata, deviceProfileId } = marshallDeviceVerificationQueryParams(
    searchParams.toString(),
  );
  const { browser, os, deviceIp } = metadata;
  const { mutate: mutateDeviceCheckQuery } = useDeviceCheckQuery();
  const { mutate: mutateDeviceApproveQuery } = useDeviceApproveQuery();

  useEffect(() => {
    mutateDeviceCheckQuery(deviceProfileId, {
      onSuccess: response => {
        if (response.status === 'approved') {
          setVerificationStatus(DeviceVerificationStatus.Approved);
        } else if (response.status === 'rejected') {
          setVerificationStatus(DeviceVerificationStatus.Rejected);
        } else {
          const expiryHandle = setInterval(() => {
            if (Date.now() > expiryTimestamp * 1000) {
              setVerificationStatus(DeviceVerificationStatus.Expired);
            }
          }, 1000);
          return () => window.clearInterval(expiryHandle);
        }
        return () => {};
      },
      onError: () => {
        setVerificationStatus(DeviceVerificationStatus.Expired);
      },
    });
  }, [deviceProfileId]);

  const handleApprovalOrReject = useCallback(
    (approve: boolean) => {
      mutateDeviceApproveQuery(
        { deviceProfileId, deviceToken, isApproved: approve },
        {
          onSuccess: () => {
            setVerificationStatus(approve ? DeviceVerificationStatus.Approved : DeviceVerificationStatus.Rejected);
          },
        },
      );
    },
    [deviceProfileId, deviceToken, mutateDeviceApproveQuery, setVerificationStatus],
  );

  return (
    <>
      {assetUri && (
        <Page.Icon>
          <Box mt={6}>
            <ClientAssetLogo assetUri={assetUri} />
          </Box>
        </Page.Icon>
      )}
      <Page.Content>
        <Text.H4>{t('Approve login?')}</Text.H4>
        <VStack width="full" my={4} gap={3.5}>
          <VStack width="full" alignItems={'flex-start'}>
            <Text size="sm" fontWeight="semibold" fontColor="text.tertiary" styles={{ lineHeight: 1.2 }}>
              {t('New Browser/Device')}
            </Text>
            <Text>
              {browser}, {os}
            </Text>
            <div className={css({ width: 'full', height: 0.5, bg: 'surface.tertiary' })} />
          </VStack>
          <hr />

          <VStack width="full" alignItems={'flex-start'}>
            <Text size="sm" fontWeight="semibold" fontColor="text.tertiary" styles={{ lineHeight: 1.2 }}>
              {t('Website')}
            </Text>
            <Text>{origin}</Text>
            <div className={css({ width: 'full', height: 0.5, bg: 'surface.tertiary' })} />
          </VStack>
          <hr />

          <VStack width="full" alignItems={'flex-start'}>
            <Text size="sm" fontWeight="semibold" fontColor="text.tertiary" styles={{ lineHeight: 1.2 }}>
              {t('New Device IP Address')}
            </Text>
            <Text>{deviceIp}</Text>
          </VStack>
        </VStack>

        <HStack width={'full'} gap={4}>
          <Button expand variant="negative" label={t('Reject')} onPress={() => handleApprovalOrReject(false)} />
          <Button expand variant="positive" label={t('Approve')} onPress={() => handleApprovalOrReject(true)} />
        </HStack>
      </Page.Content>
    </>
  );
};
