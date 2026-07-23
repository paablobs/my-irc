import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  nickname: string;
  username: string;
  realname: string;
  server: string;
  port: number;
  error: string | null;
  reconnectAttempts: number;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionInfo: (info: { nickname: string; username: string; realname: string; server: string; port: number }) => void;
  setError: (error: string | null) => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;
  disconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      isConnected: false,
      isConnecting: false,
      nickname: '',
      username: '',
      realname: '',
      server: 'localhost',
      port: 6667,
      error: null,
      reconnectAttempts: 0,

      setConnected: (connected) => set({ isConnected: connected, isConnecting: false, error: null }),

      setConnecting: (connecting) => set({ isConnecting: connecting }),

      setConnectionInfo: (info) => set(info),

      setError: (error) => set({ error, isConnecting: false }),

      incrementReconnect: () => set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),

      resetReconnect: () => set({ reconnectAttempts: 0 }),

      disconnect: () =>
        set({
          isConnected: false,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }),
    }),
    {
      name: 'irc-connection',
      partialize: (state) => ({
        nickname: state.nickname,
        username: state.username,
        realname: state.realname,
        server: state.server,
        port: state.port,
      }),
    },
  ),
);
