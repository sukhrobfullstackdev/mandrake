export type ConfirmActionPollerQueryKey = ReturnType<typeof confirmActionQueryKeys.status>;

export type ConfirmActionPollerParams = {
  authUserId: string;
  confirmationId: string;
};

export const confirmActionQueryKeys = {
  base: ['confirm-action'] as const,

  status: (params: ConfirmActionPollerParams) => [[...confirmActionQueryKeys.base, 'status'], params] as const,
};
