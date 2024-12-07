export function ipfsToHttp(ipfsUrl: string): string {
  const ipfsHttpGateway = 'https://ipfs.io/ipfs/';
  return ipfsUrl.replace('ipfs://', ipfsHttpGateway);
}
