export type MagicMethodEventData = MessageEvent['data'] & {
  clientAppOrigin: string;
};
