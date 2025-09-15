import { useCallback } from 'react';
import { lastValueFrom } from 'rxjs';
import { ServerComponentProvider } from '@/providers';
import { fetchMusic$ } from '@/hooks';
import { Tracks, Navigator } from '@/components';

export default function Home() {
  const fetchMusic = useCallback(
    async () => await lastValueFrom(fetchMusic$()),
    [],
  );

  return (
    <div className="bg-background rounded-2xl w-screen h-screen flex flex-row items-stretch overflow-hidden relative pr-10 pl-4 gap-x-4">
      <aside className="w-14">
        <div className="h-20" />
        <div className="mt-8">
          <Navigator />
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-20"></header>
        <div className="relative flex-1 mt-8">
          <div className="absolute top-0 left-0 right-0 bottom-0">
            <ServerComponentProvider queryFn={fetchMusic} queryKey={['music']}>
              <Tracks />
            </ServerComponentProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
