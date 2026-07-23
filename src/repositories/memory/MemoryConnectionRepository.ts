import type { Connection } from '../../models/Connection.js';
import type { ConnectionRepository } from '../interfaces/ConnectionRepository.js';

export class MemoryConnectionRepository implements ConnectionRepository {
  private readonly connections = new Map<string, Connection>();

  async findById(id: string): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async save(connection: Connection): Promise<void> {
    this.connections.set(connection.id, connection);
  }

  async delete(id: string): Promise<boolean> {
    return this.connections.delete(id);
  }

  async findAll(): Promise<Connection[]> {
    return Array.from(this.connections.values());
  }

  async count(): Promise<number> {
    return this.connections.size;
  }
}
