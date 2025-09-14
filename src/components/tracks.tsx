'use client';

import type { ReactElement } from 'react';

import { useMusicQuery } from '@/hooks';

export default function Tracks(): ReactElement {
  const { data: tracks } = useMusicQuery();

  return <div>{JSON.stringify(tracks)}</div>;
}
