import { decodeBase64 } from './base64';

export interface CredentialCreateOptionsFromServer {
  challenge: string;
  user: {
    id: string;
    name: string;
    displayName: string;
  };
}

export interface CredentialRequestOptionsFromServer {
  challenge: string;
  allowCredentials: {
    id: string;
    type: string;
  }[];
}

/**
 * Transforms items in the credentialCreateOptions generated on the server
 * into byte arrays expected by the navigator.credentials.create() call
 * @param {Object} credentialCreateOptionsFromServer
 */
export const transformCredentialCreateOptions = (
  credentialCreateOptionsFromServer: Partial<CredentialCreateOptionsFromServer>,
) => {
  const { challenge, user } = credentialCreateOptionsFromServer;
  const transformedUserId = user?.id
    ? Uint8Array.from(decodeBase64(user!.id.replace(/\_/g, '/').replace(/\-/g, '+')), c => c.charCodeAt(0))
    : '';
  const transformedChallenge = Uint8Array.from(decodeBase64(challenge!.replace(/\_/g, '/').replace(/\-/g, '+')), c =>
    c.charCodeAt(0),
  );
  return {
    ...credentialCreateOptionsFromServer,
    challenge: transformedChallenge,
    user: { ...user, id: transformedUserId },
  };
};

export const transformCredentialRequestOptions = (
  credentialRequestOptionsFromServer: CredentialRequestOptionsFromServer,
) => {
  const { challenge, allowCredentials } = credentialRequestOptionsFromServer;

  const transformedChallenge = Uint8Array.from(atob(challenge.replace(/\_/g, '/').replace(/\-/g, '+')), c =>
    c.charCodeAt(0),
  );

  const transformedAllowCredentials = allowCredentials.map(credentialDescriptor => {
    const { id } = credentialDescriptor;

    const transformedId = id.replace(/\_/g, '/').replace(/\-/g, '+');
    const transformedIdUint8 = Uint8Array.from(atob(transformedId), c => c.charCodeAt(0));
    return { ...credentialDescriptor, id: transformedIdUint8 };
  });

  return {
    ...credentialRequestOptionsFromServer,
    challenge: transformedChallenge,
    allowCredentials: transformedAllowCredentials,
  };
};
