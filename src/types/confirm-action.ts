import { ConfirmActionInfo, ConfirmActionType } from '@hooks/data/embedded/confirm-action';

export enum ActionStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

export interface DecodedTctPayload {
  payload: ConfirmActionInfo;
  api_key: string;
  confirmation_id: string;
  action: ConfirmActionType;
  exp: number;
  iat: number;
}
