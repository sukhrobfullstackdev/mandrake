/**
 * OpenID Connect user info surfaced with the `profile` scope.
 */
export type OpenIDConnectProfile<T extends 'snake_case' | 'camelCase'> = T extends 'camelCase'
  ? {
      name?: string;
      familyName?: string;
      givenName?: string;
      middleName?: string;
      nickname?: string;
      preferredUsername?: string;
      profile?: string;
      picture?: string;
      website?: string;
      gender?: string;
      birthdate?: string;
      zoneinfo?: string;
      locale?: string;
      updatedAt?: number;
    }
  : {
      name?: string;
      family_name?: string;
      given_name?: string;
      middle_name?: string;
      nickname?: string;
      preferred_username?: string;
      profile?: string;
      picture?: string;
      website?: string;
      gender?: string;
      birthdate?: string;
      zoneinfo?: string;
      locale?: string;
      updated_at?: number;
    };

/**
 * OpenID Connect user info surfaced with the `email` scope.
 */
export type OpenIDConnectEmail<T extends 'snake_case' | 'camelCase'> = T extends 'camelCase'
  ? {
      email?: string;
      emailVerified?: boolean;
    }
  : {
      email?: string;
      email_verified?: boolean;
    };

/**
 * OpenID Connect user info surfaced with the `phone` scope.
 */
export type OpenIDConnectPhone<T extends 'snake_case' | 'camelCase'> = T extends 'camelCase'
  ? {
      phoneNumber?: string;
      phoneNumberVerified?: boolean;
    }
  : {
      phone_number?: string;
      phone_number_verified?: boolean;
    };

/**
 * OpenID Connect user info surfaced with the `address` scope.
 */
export type OpenIDConnectAddress<T extends 'snake_case' | 'camelCase'> = T extends 'camelCase'
  ? {
      address?: {
        formatted?: string;
        streetAddress?: string;
        locality?: string;
        region?: string;
        postalCode?: string;
        country?: string;
      };
    }
  : {
      address?: {
        formatted?: string;
        street_address?: string;
        locality?: string;
        region?: string;
        postal_code?: string;
        country?: string;
      };
    };

/**
 * All-encompassing interface to represent OpenID Connect user info claims.
 */
export type OpenIDConnectUserInfo<T extends 'snake_case' | 'camelCase'> = { sub?: string } & OpenIDConnectProfile<T> &
  OpenIDConnectEmail<T> &
  OpenIDConnectPhone<T> &
  OpenIDConnectAddress<T> &
  Record<string, unknown>;

/**
 * A list of all standard OpenID Connect user info fields.
 */
export const OpenIDConnectFieldsList = [
  'sub',
  'name',
  'family_name',
  'given_name',
  'middle_name',
  'nickname',
  'preferred_username',
  'profile',
  'picture',
  'website',
  'gender',
  'birthdate',
  'zoneinfo',
  'locale',
  'updated_at',
  'email',
  'email_verified',
  'phone_number',
  'phone_number_verified',
  'address.formatted',
  'address.street_address',
  'address.locality',
  'address.region',
  'address.postal_code',
  'address.country',
] as const;

export type OpenIDConnectFields = (typeof OpenIDConnectFieldsList)[number];
