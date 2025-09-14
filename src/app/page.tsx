import { useCallback } from 'react';
import { lastValueFrom } from 'rxjs';

import { ServerComponentProvider } from '@/providers';
import { fetchMusic$ } from '@/hooks';
import { Tracks } from '@/components';

export default function Home() {
  const fetchMusic = useCallback(
    async () => await lastValueFrom(fetchMusic$()),
    [],
  );

  return (
    <div className="bg-background rounded-2xl w-screen h-screen overflow-hidden">
      <ServerComponentProvider queryFn={fetchMusic} queryKey={['music']}>
        <Tracks />
      </ServerComponentProvider>
    </div>
  );
}
