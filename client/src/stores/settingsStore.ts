import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  theme: 'dark' | 'light';
  accentColor: string;
  fontSize: number;
  timestampFormat: '12h' | '24h';
  showJoinPart: boolean;
  showNickChanges: boolean;
  notifications: boolean;
  notificationSound: boolean;
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  showUserList: boolean;
  compactMode: boolean;
  emojiPicker: boolean;
}

export interface SettingsState {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  accentColor: '#0073e6',
  fontSize: 14,
  timestampFormat: '24h',
  showJoinPart: true,
  showNickChanges: true,
  notifications: true,
  notificationSound: true,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  showUserList: true,
  compactMode: false,
  emojiPicker: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'irc-settings',
    },
  ),
);
