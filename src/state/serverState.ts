import type { ServerConfig } from '../models/Server.js';
import { Server } from '../models/Server.js';
import type { UserRepository } from '../repositories/interfaces/UserRepository.js';
import type { ChannelRepository } from '../repositories/interfaces/ChannelRepository.js';
import type { ConnectionRepository } from '../repositories/interfaces/ConnectionRepository.js';
import { MemoryUserRepository } from '../repositories/memory/MemoryUserRepository.js';
import { MemoryChannelRepository } from '../repositories/memory/MemoryChannelRepository.js';
import { MemoryConnectionRepository } from '../repositories/memory/MemoryConnectionRepository.js';

export interface ServerStateContainer {
  readonly server: Server;
  readonly users: UserRepository;
  readonly channels: ChannelRepository;
  readonly connections: ConnectionRepository;
}

export function createServerState(config: ServerConfig): ServerStateContainer {
  return {
    server: new Server(config),
    users: new MemoryUserRepository(),
    channels: new MemoryChannelRepository(),
    connections: new MemoryConnectionRepository(),
  };
}
