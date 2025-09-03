'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { ReactElement, ReactNode } from 'react';

import { useMusicStore } from '@/stores';

export default function Layout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const fetchMusic = useMusicStore(useShallow(({ fetchMusic }) => fetchMusic));

  useEffect(() => {
    void fetchMusic();
  }, [fetchMusic]);

  return <>{children}</>;
}
