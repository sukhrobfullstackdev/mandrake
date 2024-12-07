import { isAddress } from 'ethers';

export const isMessageHexString = (msg: string) => typeof msg === 'string' && msg.startsWith('0x') && !isAddress(msg);
