export enum RecoveryMethodType {
  PhoneNumber = 'phone_number',
  EmailAddress = 'email_address',
}

export type RecoveryFactor = {
  type: RecoveryMethodType;
  value: string;
};
