import type { Channel } from '../models/Channel.js';
import type { User } from '../models/User.js';
import type { ServerStateContainer } from '../state/serverState.js';
import { Channel as ChannelModel } from '../models/Channel.js';
import { ERR } from '../protocol/numericReplies.js';

export class ChannelService {
  constructor(private readonly state: ServerStateContainer) {}

  async createChannel(name: string): Promise<Channel> {
    const channel = new ChannelModel(name);
    await this.state.channels.save(channel);
    this.state.server.incrementChannelCount();
    return channel;
  }

  async findByName(name: string): Promise<Channel | undefined> {
    return this.state.channels.findByName(name);
  }

  async join(user: User, channelName: string): Promise<{ channel: Channel; isNew: boolean }> {
    let channel = await this.state.channels.findByName(channelName);
    let isNew = false;

    if (!channel) {
      channel = await this.createChannel(channelName);
      isNew = true;
    }

    if (channel.hasUser(user.nickname)) {
      return { channel, isNew };
    }

    channel.addUser(user.nickname);
    user.addChannel(channelName);
    await this.state.users.save(user);

    if (isNew) {
      channel.addUserMode(user.nickname, 'o');
    }

    return { channel, isNew };
  }

  async part(user: User, channelName: string, _reason?: string): Promise<Channel | undefined> {
    const channel = await this.state.channels.findByName(channelName);
    if (!channel) {
      return undefined;
    }

    if (!channel.hasUser(user.nickname)) {
      return undefined;
    }

    channel.removeUser(user.nickname);
    user.removeChannel(channelName);
    await this.state.users.save(user);

    if (channel.userCount === 0) {
      await this.state.channels.delete(channelName);
      this.state.server.decrementChannelCount();
      return undefined;
    }

    return channel;
  }

  async kick(
    operator: User,
    target: User,
    channelName: string,
    _reason?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const channel = await this.state.channels.findByName(channelName);
    if (!channel) {
      return { success: false, error: ERR.NOSUCHCHANNEL };
    }

    if (!channel.hasUser(operator.nickname)) {
      return { success: false, error: ERR.NOTONCHANNEL };
    }

    if (!channel.hasUser(target.nickname)) {
      return { success: false, error: ERR.USERNOTINCHANNEL };
    }

    if (!channel.hasUserMode(operator.nickname, 'o')) {
      return { success: false, error: ERR.CHANOPRIVSNEEDED };
    }

    channel.removeUser(target.nickname);
    target.removeChannel(channelName);
    await this.state.users.save(target);

    return { success: true };
  }

  async setTopic(
    user: User,
    channelName: string,
    topic: string,
  ): Promise<{ success: boolean; error?: string }> {
    const channel = await this.state.channels.findByName(channelName);
    if (!channel) {
      return { success: false, error: ERR.NOSUCHCHANNEL };
    }

    if (!channel.hasUser(user.nickname)) {
      return { success: false, error: ERR.NOTONCHANNEL };
    }

    if (channel.modes.has('t') && !channel.hasUserMode(user.nickname, 'o')) {
      return { success: false, error: ERR.CHANOPRIVSNEEDED };
    }

    channel.setTopic(topic, user.nickname);
    return { success: true };
  }

  async invite(
    user: User,
    target: User,
    channelName: string,
  ): Promise<{ success: boolean; error?: string }> {
    const channel = await this.state.channels.findByName(channelName);
    if (!channel) {
      return { success: false, error: ERR.NOSUCHCHANNEL };
    }

    if (!channel.hasUser(user.nickname)) {
      return { success: false, error: ERR.NOTONCHANNEL };
    }

    channel.inviteList.add(target.nickname.toLowerCase());
    return { success: true };
  }

  async broadcastToChannel(channelName: string, message: string, excludeNickname?: string): Promise<void> {
    const channel = await this.state.channels.findByName(channelName);
    if (!channel) {
      return;
    }

    for (const nickname of channel.userNicknames) {
      if (excludeNickname && nickname.toLowerCase() === excludeNickname.toLowerCase()) {
        continue;
      }
      const user = await this.state.users.findByNickname(nickname);
      if (user) {
        const connection = await this.state.connections.findById(user.connectionId);
        if (connection) {
          connection.send(message);
        }
      }
    }
  }

  async getAllChannels(): Promise<Channel[]> {
    return this.state.channels.findAll();
  }

  async getChannelCount(): Promise<number> {
    return this.state.channels.count();
  }
}
