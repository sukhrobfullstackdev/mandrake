import { MagicAPIResponse } from '@custom-types/api-response';

type ExtraErrorData = object;

export class ApiResponseError extends Error {
  public data?: ExtraErrorData;

  public message: string;

  public response?: MagicAPIResponse;

  public status_code?: number;

  constructor(response: MagicAPIResponse, data: ExtraErrorData = {}) {
    super(`[${response.error_code}] ${response?.message}`); // Call the constructor of the base Error class.
    this.name = this.constructor.name; // Set the error name to the name of the new class.
    this.message = response?.message;
    this.data = data;
    this.response = response;
    this.status_code = response?.status_code;
    this.cause = response;

    // Maintaining proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
