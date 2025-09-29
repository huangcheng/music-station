import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

import { DEFAULT_SETTINGS } from '@/constants';

import type { Settings } from '@/schemas';

interface SettingsState {
  settings: Settings;
}

interface SettingsActions {
  setSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        settings: DEFAULT_SETTINGS,
        setSettings: (settings) =>
          set((state) => ({
            settings: { ...state.settings, ...settings },
          })),
        resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      }),
      {
        name: 'settings-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ settings: state.settings }),
      },
    ),
  ),
);
