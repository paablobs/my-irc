import type { User } from '../../models/User.js';

export interface UserRepository {
  findById(id: string): Promise<User | undefined>;
  findByNickname(nickname: string): Promise<User | undefined>;
  findByConnectionId(connectionId: string): Promise<User | undefined>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<User[]>;
  count(): Promise<number>;
  existsByNickname(nickname: string): Promise<boolean>;
  createUser(params: {
    connectionId: string;
    nickname: string;
    hostname: string;
    serverName: string;
  }): Promise<User>;
}
