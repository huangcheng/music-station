'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';

import type { ReactElement } from 'react';

import { useMediaStore } from '@/stores';

export default function Winamp(): ReactElement {
  const music = useMediaStore(useShallow(({ music }) => music));

  return (
    <div>
      {music.map((m) => (
        <div key={m.name}>
          {m.cover && (
            <Image
              src={`/api/upload?file=${m.cover}`}
              alt={m.name}
              width={200}
              height={200}
            />
          )}
          <a href={`/api/upload?file=${m.file}`}>{m.name}</a>
        </div>
      ))}
    </div>
  );
}
