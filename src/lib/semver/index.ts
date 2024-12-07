import semver from 'semver';

export const isSdkVersionGreaterOrEqual = (versionToCompare: string, versionFromSdk?: string): boolean => {
  if (versionFromSdk) {
    const coercedVersion = semver.coerce(versionFromSdk);
    if (coercedVersion) return semver.gte(coercedVersion.version, versionToCompare);
  }
  return true;
};
