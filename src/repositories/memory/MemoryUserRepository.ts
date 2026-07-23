import type { User } from '../../models/User.js';
import type { UserRepository } from '../interfaces/UserRepository.js';
import { User as UserModel } from '../../models/User.js';
import { randomUUID } from 'node:crypto';

export class MemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();
  private readonly nicknameIndex = new Map<string, string>();
  private readonly connectionIndex = new Map<string, string>();

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async findByNickname(nickname: string): Promise<User | undefined> {
    const id = this.nicknameIndex.get(nickname.toLowerCase());
    if (id === undefined) {
      return undefined;
    }
    return this.users.get(id);
  }

  async findByConnectionId(connectionId: string): Promise<User | undefined> {
    const id = this.connectionIndex.get(connectionId);
    if (id === undefined) {
      return undefined;
    }
    return this.users.get(id);
  }

  async save(user: User): Promise<void> {
    const existing = this.users.get(user.id);
    if (existing) {
      this.nicknameIndex.delete(existing.nickname.toLowerCase());
    }
    this.users.set(user.id, user);
    this.nicknameIndex.set(user.nickname.toLowerCase(), user.id);
    this.connectionIndex.set(user.connectionId, user.id);
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }
    this.nicknameIndex.delete(user.nickname.toLowerCase());
    this.connectionIndex.delete(user.connectionId);
    return this.users.delete(id);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    return this.nicknameIndex.has(nickname.toLowerCase());
  }

  async createUser(params: {
    connectionId: string;
    nickname: string;
    hostname: string;
    serverName: string;
  }): Promise<User> {
    const user = new UserModel({
      id: randomUUID(),
      connectionId: params.connectionId,
      nickname: params.nickname,
      hostname: params.hostname,
      serverName: params.serverName,
    });
    await this.save(user);
    return user;
  }
}
