import { NextIntlClientProvider } from 'next-intl';

import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { QueryProvider, GlobalStoreProvider } from '@/providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Music Station',
  description: 'All-in-one tracks streaming web app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NextIntlClientProvider>
          <QueryProvider>
            <GlobalStoreProvider>{children}</GlobalStoreProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
