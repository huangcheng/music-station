'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { ReactElement, ReactNode } from 'react';

import { useMediaStore } from '@/stores';

export default function Layout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const fetch = useMediaStore(useShallow(({ fetch }) => fetch));

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return <>{children}</>;
}
