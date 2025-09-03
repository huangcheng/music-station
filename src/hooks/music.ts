import { lastValueFrom } from 'rxjs';
import { useQuery } from '@tanstack/react-query';
import { fetchMusic$ } from '@/hooks/api';

export const useMusicQuery = () =>
  useQuery({
    queryKey: ['music'],
    queryFn: async () => lastValueFrom(fetchMusic$()),
  });
