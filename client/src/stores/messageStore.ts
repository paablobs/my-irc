import { create } from 'zustand';

export interface Message {
  id: string;
  channel: string;
  sender: string;
  senderHostmask?: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'action' | 'notice' | 'system' | 'error' | 'join' | 'part' | 'quit' | 'kick' | 'nick' | 'topic' | 'mode';
  target?: string;
}

export interface MessageState {
  messages: Map<string, Message[]>;
  addMessage: (channel: string, message: Message) => void;
  getMessages: (channel: string) => Message[];
  clearMessages: (channel: string) => void;
  addSystemMessage: (channel: string, content: string) => void;
}

let messageIdCounter = 0;

export const useMessageStore = create<MessageState>()((set, get) => ({
  messages: new Map(),

  addMessage: (channel, message) =>
    set((state) => {
      const messages = new Map(state.messages);
      const channelMessages = messages.get(channel.toLowerCase()) || [];
      messages.set(channel.toLowerCase(), [...channelMessages, { ...message, id: message.id || `msg-${++messageIdCounter}` }]);
      return { messages };
    }),

  getMessages: (channel) => get().messages.get(channel.toLowerCase()) || [],

  clearMessages: (channel) =>
    set((state) => {
      const messages = new Map(state.messages);
      messages.delete(channel.toLowerCase());
      return { messages };
    }),

  addSystemMessage: (channel, content) =>
    set((state) => {
      const messages = new Map(state.messages);
      const channelMessages = messages.get(channel.toLowerCase()) || [];
      messages.set(channel.toLowerCase(), [
        ...channelMessages,
        {
          id: `msg-${++messageIdCounter}`,
          channel,
          sender: '*',
          content,
          timestamp: new Date(),
          type: 'system',
        },
      ]);
      return { messages };
    }),
}));
