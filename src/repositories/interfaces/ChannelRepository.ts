import type { Channel } from '../../models/Channel.js';

export interface ChannelRepository {
  findByName(name: string): Promise<Channel | undefined>;
  save(channel: Channel): Promise<void>;
  delete(name: string): Promise<boolean>;
  findAll(): Promise<Channel[]>;
  count(): Promise<number>;
  exists(name: string): Promise<boolean>;
  findByUser(nickname: string): Promise<Channel[]>;
  createChannel(name: string): Promise<Channel>;
  getAllChannels(): Promise<Channel[]>;
}
