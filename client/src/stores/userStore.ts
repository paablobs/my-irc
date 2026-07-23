import { create } from 'zustand';

export interface User {
  nickname: string;
  username?: string;
  hostname?: string;
  realname?: string;
  modes: string[];
  away: boolean;
  awayMessage?: string;
  channels: string[];
  lastActive: Date;
  isOperator: boolean;
  isVoiced: boolean;
}

export interface UserState {
  users: Map<string, User>;
  currentUser: string | null;
  addUser: (user: User) => void;
  removeUser: (nickname: string) => void;
  updateUser: (nickname: string, updates: Partial<User>) => void;
  getUser: (nickname: string) => User | undefined;
  setCurrentUser: (nickname: string) => void;
  getUsersInChannel: (channel: string) => User[];
  changeNickname: (oldNick: string, newNick: string) => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: new Map(),
  currentUser: null,

  addUser: (user) =>
    set((state) => {
      const users = new Map(state.users);
      users.set(user.nickname.toLowerCase(), user);
      return { users };
    }),

  removeUser: (nickname) =>
    set((state) => {
      const users = new Map(state.users);
      users.delete(nickname.toLowerCase());
      return { users };
    }),

  updateUser: (nickname, updates) =>
    set((state) => {
      const users = new Map(state.users);
      const existing = users.get(nickname.toLowerCase());
      if (existing) {
        users.set(nickname.toLowerCase(), { ...existing, ...updates });
      }
      return { users };
    }),

  getUser: (nickname) => get().users.get(nickname.toLowerCase()),

  setCurrentUser: (nickname) => set({ currentUser: nickname.toLowerCase() }),

  getUsersInChannel: (channel) =>
    Array.from(get().users.values()).filter((u) => u.channels.includes(channel.toLowerCase())),

  changeNickname: (oldNick, newNick) =>
    set((state) => {
      const users = new Map(state.users);
      const user = users.get(oldNick.toLowerCase());
      if (user) {
        users.delete(oldNick.toLowerCase());
        users.set(newNick.toLowerCase(), { ...user, nickname: newNick });
      }
      return {
        users,
        currentUser: state.currentUser === oldNick.toLowerCase() ? newNick.toLowerCase() : state.currentUser,
      };
    }),
}));
