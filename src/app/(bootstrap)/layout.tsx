'use client';

import { useMount } from 'react-use';
import { useShallow } from 'zustand/react/shallow';

import type { PropsWithChildren, ReactElement } from 'react';

import { useUserStore } from '@/stores';

export default function Layout({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const { fetchUser } = useUserStore(
    useShallow(({ fetchUser }) => ({ fetchUser })),
  );

  useMount(() => {
    void fetchUser();
  });

  return <>{children}</>;
}
