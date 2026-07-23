import type { User } from '../models/User.js';
import type { ServerStateContainer } from '../state/serverState.js';
import { User as UserModel, ConnectionState } from '../models/User.js';
import { randomUUID } from 'node:crypto';

export class UserService {
  constructor(private readonly state: ServerStateContainer) {}

  async createUser(params: {
    connectionId: string;
    nickname: string;
    hostname: string;
  }): Promise<User> {
    const user = new UserModel({
      id: randomUUID(),
      connectionId: params.connectionId,
      nickname: params.nickname,
      hostname: params.hostname,
      serverName: this.state.server.config.serverName,
    });

    await this.state.users.save(user);
    this.state.server.incrementUserCount();
    return user;
  }

  async findByNickname(nickname: string): Promise<User | undefined> {
    return this.state.users.findByNickname(nickname);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.state.users.findById(id);
  }

  async findByConnectionId(connectionId: string): Promise<User | undefined> {
    return this.state.users.findByConnectionId(connectionId);
  }

  async changeNickname(userId: string, newNickname: string): Promise<boolean> {
    const user = await this.state.users.findById(userId);
    if (!user) {
      return false;
    }

    const exists = await this.state.users.existsByNickname(newNickname);
    if (exists) {
      return false;
    }

    user.nickname = newNickname;
    await this.state.users.save(user);
    return true;
  }

  async registerUser(
    userId: string,
    username: string,
    realname: string,
  ): Promise<User | undefined> {
    const user = await this.state.users.findById(userId);
    if (!user) {
      return undefined;
    }

    user.username = username;
    user.realname = realname;
    user.state = ConnectionState.REGISTERED;
    await this.state.users.save(user);
    return user;
  }

  async removeUser(userId: string): Promise<boolean> {
    const user = await this.state.users.findById(userId);
    if (!user) {
      return false;
    }

    for (const channelName of user.channels) {
      const channel = await this.state.channels.findByName(channelName);
      if (channel) {
        channel.removeUser(user.nickname);
        if (channel.userCount === 0) {
          await this.state.channels.delete(channelName);
          this.state.server.decrementChannelCount();
        }
      }
    }

    const deleted = await this.state.users.delete(userId);
    if (deleted) {
      this.state.server.decrementUserCount();
    }
    return deleted;
  }

  async isNicknameAvailable(nickname: string): Promise<boolean> {
    return !(await this.state.users.existsByNickname(nickname));
  }

  async getAllUsers(): Promise<User[]> {
    return this.state.users.findAll();
  }

  async getUserCount(): Promise<number> {
    return this.state.users.count();
  }
}
