export type EmailLinkPollerQueryKey = ReturnType<typeof emailLinkQueryKeys.status>;

export type EmailLinkPollerParams = {
  email: string;
  requestOriginMessage: string;
  jwt?: string;
  loginFlowContext?: string;
};

export const emailLinkQueryKeys = {
  base: ['magic-link'] as const,

  status: (params: EmailLinkPollerParams) => [[...emailLinkQueryKeys.base, 'status'], params] as const,
};
