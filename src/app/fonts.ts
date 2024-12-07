import { Inter } from 'next/font/google';

export const inter = Inter({
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese'],
  fallback: ['ProximaNova'],
  variable: '--inter-font',
});
