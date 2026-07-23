import type { Channel } from '../../models/Channel.js';
import type { ChannelRepository } from '../interfaces/ChannelRepository.js';
import { Channel as ChannelModel } from '../../models/Channel.js';

export class MemoryChannelRepository implements ChannelRepository {
  private readonly channels = new Map<string, Channel>();

  async findByName(name: string): Promise<Channel | undefined> {
    return this.channels.get(name.toLowerCase());
  }

  async save(channel: Channel): Promise<void> {
    this.channels.set(channel.name.toLowerCase(), channel);
  }

  async delete(name: string): Promise<boolean> {
    return this.channels.delete(name.toLowerCase());
  }

  async findAll(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async count(): Promise<number> {
    return this.channels.size;
  }

  async exists(name: string): Promise<boolean> {
    return this.channels.has(name.toLowerCase());
  }

  async findByUser(nickname: string): Promise<Channel[]> {
    const result: Channel[] = [];
    for (const channel of this.channels.values()) {
      if (channel.hasUser(nickname)) {
        result.push(channel);
      }
    }
    return result;
  }

  async createChannel(name: string): Promise<Channel> {
    const channel = new ChannelModel(name);
    await this.save(channel);
    return channel;
  }

  async getAllChannels(): Promise<Channel[]> {
    return this.findAll();
  }
}
