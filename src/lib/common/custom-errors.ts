import { RpcErrorCode } from '@constants/json-rpc';

// a custom Error designed for use in server components in RPC routes
export class ServerRpcError extends Error {
  constructor(public errorCode: RpcErrorCode = RpcErrorCode.InternalError) {
    super(errorCode.toString());
    this.name = 'ServerRpcError';

    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
