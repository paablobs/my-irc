import { create } from 'zustand';

export interface Channel {
  name: string;
  topic: string;
  topicSetBy?: string;
  joined: boolean;
  unreadCount: number;
  lastActivity: Date;
  modes: string[];
}

export interface ChannelState {
  channels: Map<string, Channel>;
  activeChannel: string | null;
  addChannel: (channel: Channel) => void;
  removeChannel: (name: string) => void;
  updateChannel: (name: string, updates: Partial<Channel>) => void;
  setActiveChannel: (name: string | null) => void;
  incrementUnread: (name: string) => void;
  clearUnread: (name: string) => void;
  getChannel: (name: string) => Channel | undefined;
  getJoinedChannels: () => Channel[];
}

export const useChannelStore = create<ChannelState>()((set, get) => ({
  channels: new Map(),
  activeChannel: null,

  addChannel: (channel) =>
    set((state) => {
      const channels = new Map(state.channels);
      channels.set(channel.name.toLowerCase(), channel);
      return { channels };
    }),

  removeChannel: (name) =>
    set((state) => {
      const channels = new Map(state.channels);
      channels.delete(name.toLowerCase());
      return {
        channels,
        activeChannel: state.activeChannel?.toLowerCase() === name.toLowerCase() ? null : state.activeChannel,
      };
    }),

  updateChannel: (name, updates) =>
    set((state) => {
      const channels = new Map(state.channels);
      const existing = channels.get(name.toLowerCase());
      if (existing) {
        channels.set(name.toLowerCase(), { ...existing, ...updates });
      }
      return { channels };
    }),

  setActiveChannel: (name) => set({ activeChannel: name?.toLowerCase() ?? null }),

  incrementUnread: (name) =>
    set((state) => {
      const channels = new Map(state.channels);
      const channel = channels.get(name.toLowerCase());
      if (channel) {
        channels.set(name.toLowerCase(), {
          ...channel,
          unreadCount: channel.unreadCount + 1,
        });
      }
      return { channels };
    }),

  clearUnread: (name) =>
    set((state) => {
      const channels = new Map(state.channels);
      const channel = channels.get(name.toLowerCase());
      if (channel) {
        channels.set(name.toLowerCase(), { ...channel, unreadCount: 0 });
      }
      return { channels };
    }),

  getChannel: (name) => get().channels.get(name.toLowerCase()),

  getJoinedChannels: () => Array.from(get().channels.values()).filter((c) => c.joined),
}));
