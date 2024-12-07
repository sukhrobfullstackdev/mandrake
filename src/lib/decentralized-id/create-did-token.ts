import { encodeBase64 } from '@lib/utils/base64';
import Web3Service from '@utils/web3-services/web3-service';
import { v4 as uuid } from 'uuid';
import { generateUserId } from './generate-user-id';

export const DEFAULT_TOKEN_LIFESPAN = 60 * 15; // 15 minutes as seconds

export interface DidTokenClaim {
  iat: number;
  ext: number;
  iss: string;
  sub: string;
  aud: string;
  nbf: number;
  tid: string;
  add: string;
}

export interface CreateDIDTokenOptions {
  account: {
    address: string;
    privateKey: string;
  };
  subject: string;
  audience: string;
  lifespan?: number;
  attachment?: string;
  systemClockOffset?: number;
}

export async function personalSign(message: string, privateKey: string) {
  const signature = await Web3Service.personalSign(message, privateKey);
  return signature;
}

export async function createDIDToken(options: CreateDIDTokenOptions): Promise<string> {
  const { account, subject, audience, lifespan = DEFAULT_TOKEN_LIFESPAN, attachment, systemClockOffset = 0 } = options;
  const utcTimeSecs = Math.floor(Date.now() / 1000) + Math.floor(systemClockOffset / 1000);

  const add = await personalSign(attachment || 'none', account.privateKey);
  const iss = await generateUserId(account.address);
  const claim = JSON.stringify({
    iat: utcTimeSecs,
    ext: utcTimeSecs + lifespan,
    iss,
    sub: subject,
    aud: audience,
    nbf: utcTimeSecs,
    tid: uuid(),
    add,
  } as DidTokenClaim);

  // The final token is an encoded string containing a JSON tuple: [proof, claim]
  // proof should be a signed claim, if correct.
  const proof = await personalSign(claim, account.privateKey);
  return encodeBase64(JSON.stringify([proof, claim]));
}
