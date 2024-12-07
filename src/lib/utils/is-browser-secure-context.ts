import { HAS_BUILT_IN_CRYPTO } from '@utils/crypto';

const HAS_SUBTLE_CRYPTO = typeof window !== 'undefined' && HAS_BUILT_IN_CRYPTO && !!window.crypto.subtle;

export const isBrowserSecureContext = window.isSecureContext && HAS_SUBTLE_CRYPTO;
