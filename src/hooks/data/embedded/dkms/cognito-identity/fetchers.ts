import { CognitoIdentityClient, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { GET_CREDENTIALS_PROXY_URL } from '@constants/env';
import { AWS_KMS_REGION } from '@constants/kms';
import { type QueryFunction } from '@tanstack/react-query';
import { SHA256 } from 'crypto-js';
import { GetCredentialsQueryKey } from './keys';
import { KMSServiceException } from '@aws-sdk/client-kms';
import { logAwsErrorMessage, KmsServiceType } from '@lib/dkms/log-aws-error-message';

export const makeGetCredentialsFetcher =
  (): QueryFunction<AwsCredentialIdentity, GetCredentialsQueryKey> =>
  async ({ queryKey: [, { delegatedAccessToken, delegatedIdentityId, systemClockOffset }] }) => {
    const body = {
      IdentityId: delegatedIdentityId,
      Logins: {
        'cognito-identity.amazonaws.com': delegatedAccessToken,
      },
    };

    if (!GET_CREDENTIALS_PROXY_URL) {
      logger.error('DKMS - Missing GET_CREDENTIALS_PROXY_URL');
    }

    const bodySHA = SHA256(JSON.stringify(body)).toString();

    const client = new CognitoIdentityClient({
      region: AWS_KMS_REGION,
      systemClockOffset,
      endpoint: `${GET_CREDENTIALS_PROXY_URL}/get-credentials/${bodySHA}`,
      logger,
    });

    const command = new GetCredentialsForIdentityCommand(body);

    try {
      const res = await client.send(command);

      return {
        accessKeyId: res.Credentials?.AccessKeyId,
        secretAccessKey: res.Credentials?.SecretKey,
        sessionToken: res.Credentials?.SessionToken,
        expiration: res.Credentials?.Expiration,
      } as AwsCredentialIdentity;
    } catch (e) {
      const err = e as KMSServiceException;
      logAwsErrorMessage(err, KmsServiceType.CognitoIdentity);
      throw e;
    }
  };
