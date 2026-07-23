import type { Connection } from '../models/Connection.js';
import type { ServerStateContainer } from '../state/serverState.js';

export class ConnectionManager {
  constructor(private readonly state: ServerStateContainer) {}

  async addConnection(connection: Connection): Promise<void> {
    await this.state.connections.save(connection);
    this.state.server.incrementConnectionCount();
  }

  async removeConnection(connectionId: string): Promise<boolean> {
    const connection = await this.state.connections.findById(connectionId);
    if (!connection) {
      return false;
    }

    connection.disconnect();
    const deleted = await this.state.connections.delete(connectionId);
    if (deleted) {
      this.state.server.decrementConnectionCount();
    }
    return deleted;
  }

  async getConnection(connectionId: string): Promise<Connection | undefined> {
    return this.state.connections.findById(connectionId);
  }

  async getAllConnections(): Promise<Connection[]> {
    return this.state.connections.findAll();
  }

  async getConnectionCount(): Promise<number> {
    return this.state.connections.count();
  }

  async broadcast(data: string): Promise<void> {
    const connections = await this.state.connections.findAll();
    for (const connection of connections) {
      if (connection.isConnected) {
        connection.send(data);
      }
    }
  }
}
