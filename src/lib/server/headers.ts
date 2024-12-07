import { headers } from 'next/headers';

export const getServerPathname = (): string | null => {
  const headersList = headers();
  return headersList.get('x-pathname');
};
