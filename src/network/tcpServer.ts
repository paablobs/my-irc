import type { Socket } from 'node:net';
import { createServer, type Server as NetServer } from 'node:net';
import { EventEmitter } from 'node:events';
import { Connection, ConnectionStatus } from '../models/Connection.js';
import { randomUUID } from 'node:crypto';

export interface TCPServerEvents {
  connection: [Connection];
  data: [Connection, Buffer];
  disconnect: [Connection];
  error: [Error];
  listening: [void];
  close: [void];
}

export class TCPServer extends EventEmitter<TCPServerEvents> {
  private server: NetServer | null = null;
  private readonly connections = new Map<string, Connection>();

  constructor(
    private readonly host: string,
    private readonly port: number,
  ) {
    super();
  }

  get connectionCount(): number {
    return this.connections.size;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => this.handleConnection(socket));

      this.server.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      this.server.listen(this.port, this.host, () => {
        this.emit('listening');
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      for (const connection of this.connections.values()) {
        connection.disconnect();
      }
      this.connections.clear();

      this.server.close(() => {
        this.emit('close');
        this.server = null;
        resolve();
      });
    });
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  removeConnection(id: string): boolean {
    const connection = this.connections.get(id);
    if (connection) {
      connection.destroy();
      this.connections.delete(id);
      return true;
    }
    return false;
  }

  private handleConnection(socket: Socket): void {
    const id = randomUUID();
    const connection = new Connection(id, socket);

    this.connections.set(id, connection);

    socket.on('data', (data: Buffer) => {
      connection.lastActivity = new Date();
      this.emit('data', connection, data);
    });

    socket.on('close', () => {
      this.handleDisconnect(connection, id);
    });

    socket.on('error', (_error: Error) => {
      this.handleDisconnect(connection, id);
    });

    socket.on('end', () => {
      this.handleDisconnect(connection, id);
    });

    socket.on('timeout', () => {
      socket.destroy();
    });

    socket.setKeepAlive(true, 60000);
    socket.setNoDelay(true);
    socket.setTimeout(300000);

    this.emit('connection', connection);
  }

  private handleDisconnect(connection: Connection, id: string): void {
    if (connection.status === ConnectionStatus.DISCONNECTED) {
      return;
    }
    connection.status = ConnectionStatus.DISCONNECTED;
    this.connections.delete(id);
    this.emit('disconnect', connection);
  }
}
