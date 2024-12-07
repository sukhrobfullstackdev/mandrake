'use client';

import { useNewTabContext } from '@components/new-tab/new-tab-context';
import PageFooter from '@components/show-ui/footer';
import { JWKSetForDeviceToken } from '@constants/device-verification';
import { DeviceVerificationStatus } from '@custom-types/new-device-verification';
import { useDeviceApproveQuery } from '@hooks/data/embedded/device-verification';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { marshallDeviceVerificationQueryParams } from '@lib/device-verification/marshalParams';
import { verifyUASig } from '@lib/device-verification/ua-sig';
import { Header, LoadingSpinner, Page, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { jwtVerify } from 'jose';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DeviceApproved } from './device-approved';
import { DeviceLinkExpired } from './device-link-expired';
import { DeviceRegistration } from './device-registration';
import { DeviceRejected } from './device-rejected';

export default function NewDeviceVerification() {
  const [verificationStatus, setVerificationStatus] = useState(DeviceVerificationStatus.NotStarted);
  const { mutate: mutateDeviceApproveQuery } = useDeviceApproveQuery();
  const searchParams = useSearchParams();
  const { t } = useTranslation('send');
  const { isThemeLoaded } = useNewTabContext();

  const { deviceToken, expiryTimestamp, metadata, deviceProfileId, ak } = marshallDeviceVerificationQueryParams(
    searchParams.toString(),
  );

  // handle extracting api key from OAuth meta cookie
  useEffect(() => {
    if (ak) {
      useStore.setState({ magicApiKey: ak });
    }
  }, [ak]);

  useEffect(() => {
    (async () => {
      try {
        // Verify the JWT
        await jwtVerify(deviceToken, JWKSetForDeviceToken);

        if (Date.now() > expiryTimestamp * 1000) {
          setVerificationStatus(DeviceVerificationStatus.Expired);
        } else {
          const isSameIFrameContext = await verifyUASig(metadata.uaSig);
          if (isSameIFrameContext) {
            mutateDeviceApproveQuery(
              { deviceProfileId, deviceToken, isApproved: true },
              {
                onSuccess: () => {
                  setVerificationStatus(DeviceVerificationStatus.Approved);
                },
                onError: () => {
                  setVerificationStatus(DeviceVerificationStatus.Expired);
                },
              },
            );
          } else {
            setVerificationStatus(DeviceVerificationStatus.NeedsFurtherApproval);
          }
        }
      } catch (e) {
        setVerificationStatus(DeviceVerificationStatus.Expired);
      }
    })();
  }, []);

  const displayPage = (status: DeviceVerificationStatus) => {
    switch (status) {
      case DeviceVerificationStatus.Approved:
        return <DeviceApproved />;
      case DeviceVerificationStatus.Expired:
        return <DeviceLinkExpired />;
      case DeviceVerificationStatus.NeedsFurtherApproval:
        return <DeviceRegistration setVerificationStatus={setVerificationStatus} />;
      case DeviceVerificationStatus.Rejected:
        return <DeviceRejected />;
      default:
        return (
          <Page.Content>
            <VStack gap={4}>
              <LoadingSpinner size={48} strokeWidth={5} />
              <Box mt={3}>
                <Text.H4 styles={{ fontWeight: 'normal' }}>{t('Verifying your device')}</Text.H4>
              </Box>
            </VStack>
          </Page.Content>
        );
    }
  };

  return (
    <Page backgroundType="solid" isOpen={isThemeLoaded}>
      <Page.Header>
        <Header.Content>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {metadata.email}
          </Text>
        </Header.Content>
      </Page.Header>
      {displayPage(verificationStatus)}
      <PageFooter />
    </Page>
  );
}
