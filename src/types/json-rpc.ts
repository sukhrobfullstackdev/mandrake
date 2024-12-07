import { RPCErrorCode } from '@magic-sdk/types';

export interface JsonRpcError {
  message: string;
  code: RPCErrorCode;
  data?: unknown;
}

export interface JsonRpcResponsePayload<ResultType = unknown> {
  jsonrpc: string;
  id: string | number | null;
  result?: ResultType | null;
  error?: JsonRpcError | null;
}

export interface JsonRpcRequestPayload<TParams = Record<string, unknown>[]> {
  jsonrpc: string;
  id: string | number | null;
  method: string;
  params?: TParams;
}

export interface PayloadData {
  /**
   * If `true`, then Semaphore permits for the flow associated to this payload
   * were already acquired, so if the payload is re-emitted or redirected to the
   * top of the RPC processing stack, Semaphore permits won't be acquired again,
   * unnecessarily.
   */
  didAcquireConcurrencySemaphorePermit: boolean;

  /**
   * Same as Semaphore permits except this if for atomic routes.
   * We don't want to try and get Semaphore again.
   */
  didAcquireAtomicSemaphorePermit: boolean;

  /**
   * An optional refresh token to be used for the request.
   */
  rt?: string;

  /**
   * A DPoP proof jwt that is required to use the optional refresh token
   * and as such is also optional.
   */
  jwt?: string;

  /**
   * For split key dkms, the device share is the Client Plaintext Share
   * encrypted with the Magic KMS, stored only on the user's device
   * If present, this saves a call to the Client KMS
   */
  deviceShare?: string;
}
