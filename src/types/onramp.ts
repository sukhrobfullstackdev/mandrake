export type StripeClientToken = {
  clientSecret: string;
};

export type PaypalStep = 'COMPOSE' | 'INITIATED' | 'PENDING' | 'COMPLETED' | 'FAILED';

export enum PaypalOrderStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PayPalPendingAndCompletedProps {
  transactionLink?: string;
  step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED;
}
