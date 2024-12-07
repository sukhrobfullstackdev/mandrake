import { KMSServiceException } from '@aws-sdk/client-kms';
import { CognitoIdentityServiceException } from '@aws-sdk/client-cognito-identity/dist-types/models/CognitoIdentityServiceException';

export enum KmsServiceType {
  KMSEncrypt = 'KMS-Encrypt',
  KMSDecrypt = 'KMS-Decrypt',
  CognitoIdentity = 'CognitoIdentity',
}

export const logAwsErrorMessage = (
  err: KMSServiceException | CognitoIdentityServiceException,
  serviceName: KmsServiceType,
) => {
  let errorMessage = `DKMS Error From ${serviceName} service name: ${err.name} message: ${err.message} `;
  if (err.name.includes('Exception')) {
    errorMessage += `requestId: ${err.$metadata.requestId} cfId: ${err.$metadata.cfId} httpStatusCode: ${err.$metadata.httpStatusCode} cause: ${err.cause} stack:${err.stack} fault: ${err.$fault} res body: ${err.$response?.body} res statusCode: ${err.$response?.statusCode} res headers: ${err.$response?.headers} `;
  } else {
    errorMessage += `fault: ${err.$fault}, code: ${err?.$response?.statusCode} `;
    if (err?.$metadata) {
      errorMessage += `${JSON.stringify(err?.$metadata)} `;
    }
    if (err?.$response) {
      errorMessage += `${JSON.stringify(err?.$response)} `;
    }
  }

  logger.error(errorMessage, { error: err, errorString: `JSON String: ${JSON.stringify(err)}` });
};
