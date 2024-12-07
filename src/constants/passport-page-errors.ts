import { PassportPageError } from '@custom-types/passport-error';

export enum PassportPageErrorCodes {
  INVALID_API_KEY = 'INVALID_API_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TECHNICAL_ERROR = 'TECHNICAL_ERROR',
  UNSUPPORTED_LOCATION = 'UNSUPPORTED_LOCATION',
  NOT_FOUND = 'NOT_FOUND',
  WALLET_ERROR = 'WALLET_ERROR',
  USER_SESSION_NOT_FOUND = 'USER_SESSION_NOT_FOUND',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  ACCOUNT_CREATION_FAILED = 'ACCOUNT_CREATION_FAILED',
  ERROR_CHECKING_CEX_RATE_LIMIT = 'ERROR_CHECKING_CEX_RATE_LIMIT',
}

export const PassportPageErrors: { [errorCode: string]: PassportPageError } = {
  [PassportPageErrorCodes.INVALID_API_KEY]: {
    heading: 'Invalid API Key',
    body: `The app you're trying to use is experiencing a technical error`,
  },
  [PassportPageErrorCodes.NETWORK_ERROR]: {
    heading: 'Network Error',
    body: `Please refresh your browser and try again.\nIf the problem persists contact this app's support team for help.`,
  },
  [PassportPageErrorCodes.TECHNICAL_ERROR]: {
    heading: 'Technical Error',
    body: `Please refresh your browser and try again.\nIf the problem persists contact this app's support team for help.`,
  },
  [PassportPageErrorCodes.UNSUPPORTED_LOCATION]: {
    heading: 'Unsupported location',
    body: `Please refresh your browser and try again.\nIf the problem persists contact this app's support team for help.`,
  },
  [PassportPageErrorCodes.NOT_FOUND]: {
    heading: 'Page Not Found',
    body: 'The page you are looking for was not found.',
  },
  [PassportPageErrorCodes.WALLET_ERROR]: {
    heading: 'Wallet Error',
    body: 'There was an error with your wallet.',
  },
  [PassportPageErrorCodes.USER_SESSION_NOT_FOUND]: {
    heading: 'User Error',
    body: 'User is not logged in. Please connect and try your request again',
  },
  [PassportPageErrorCodes.TRANSACTION_FAILED]: {
    heading: 'Something went wrong',
    body: `Transaction failed to send. Please try again.\nIf the problem persists contact this app's support team for help.`,
  },
  [PassportPageErrorCodes.ACCOUNT_CREATION_FAILED]: {
    heading: 'Something went wrong',
    body: `Account creation failed. Please try again.\nIf the problem persists contact this app's support team for help.`,
  },
  [PassportPageErrorCodes.ERROR_CHECKING_CEX_RATE_LIMIT]: {
    heading: 'Exchange Limit Exceeded',
    body: `You have exceeded the daily exchange limit of USDC to ETH. Please try again later.`,
  },
};
