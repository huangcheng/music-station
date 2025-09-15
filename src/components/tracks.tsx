'use client';

import type { ReactElement } from 'react';

import { useMusicQuery } from '@/hooks';

export default function Tracks(): ReactElement {
  const { data: tracks } = useMusicQuery();

  return <div className="h-full overflow-y-auto">{JSON.stringify(tracks)}</div>;
}
