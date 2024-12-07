export const arePasskeysSupported = async () => {
  /**
   *  Availability of `window.PublicKeyCredential` means WebAuthn is usable.
   * `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.
   * `isConditionalMediationAvailable` means the feature detection is usable.
   */
  if (
    typeof window === 'undefined' ||
    !window.PublicKeyCredential ||
    !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ||
    !PublicKeyCredential.isConditionalMediationAvailable
  ) {
    return false;
  }

  try {
    const results = await Promise.all([
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
      PublicKeyCredential.isConditionalMediationAvailable(),
    ]);

    if (results.every(result => result === true)) {
      return true;
    }
  } catch (error) {
    logger.error('Error checking passkey support:', error);
  }

  return false;
};
