'use server';

import { QUERY_OPTIONS } from '@constants/config';
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**  React.cache is an experimental caching mechanism design specifically
 * for server components. Using this inside a client component will throw an error.
 * This will store a query client for all server components to share, persisting
 * and react query cache sccross server components.  */
const serverQueryClient = cache(() => new QueryClient(QUERY_OPTIONS));

export const getServerQueryClient = (): QueryClient => serverQueryClient();
