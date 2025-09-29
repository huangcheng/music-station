import { redirect } from 'next/navigation';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { lastValueFrom } from 'rxjs';

import { fetchSelf$, logout$ } from '@/hooks';

interface UserState {
  user?: {
    id: number;
    name: string;
    email: string;
  };
  isLoggedIn?: boolean;
  cache: {
    email: string;
    remember: boolean;
  };
}

interface UserActions {
  fetchUser: () => Promise<UserState['user']>;
  setCache: (cache: Partial<UserState['cache']>) => void;
  logout: () => Promise<void>;
}

export type UserStore = UserState & UserActions;

const initialState: UserState = {
  user: undefined,
  cache: {
    email: '',
    remember: false,
  },
};

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setCache: (cache) =>
          set((state) => ({ cache: { ...state.cache, ...cache } })),
        fetchUser: async () => {
          const user = await lastValueFrom(fetchSelf$());

          set({ user: user ?? undefined });

          return user ?? undefined;
        },
        logout: async () => {
          await lastValueFrom(logout$());

          set({ user: undefined });

          redirect('/login');
        },
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: ({ cache }) => ({ cache }),
      },
    ),
  ),
);
