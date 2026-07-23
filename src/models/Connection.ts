import type { Socket } from 'node:net';

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export interface ConnectionState {
  readonly id: string;
  readonly socket: Socket;
  readonly remoteAddress: string;
  readonly remotePort: number;
  readonly connectedAt: Date;
  status: ConnectionStatus;
  userId?: string;
  sendBuffer: string;
  lastActivity: Date;
}

export class Connection implements ConnectionState {
  readonly id: string;
  readonly socket: Socket;
  readonly remoteAddress: string;
  readonly remotePort: number;
  readonly connectedAt: Date;
  status: ConnectionStatus;
  userId?: string;
  sendBuffer: string;
  lastActivity: Date;
  private drainPromise: Promise<void> | null = null;

  constructor(id: string, socket: Socket) {
    this.id = id;
    this.socket = socket;
    this.remoteAddress = socket.remoteAddress ?? 'unknown';
    this.remotePort = socket.remotePort ?? 0;
    this.connectedAt = new Date();
    this.status = ConnectionStatus.CONNECTED;
    this.sendBuffer = '';
    this.lastActivity = new Date();
  }

  get isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED && !this.socket.destroyed;
  }

  send(data: string): boolean {
    if (!this.isConnected) {
      return false;
    }
    this.lastActivity = new Date();
    const flushed = this.socket.write(data);
    if (!flushed) {
      this.sendBuffer += data;
      this.setupDrain();
      return false;
    }
    return true;
  }

  private setupDrain(): void {
    if (this.drainPromise) {
      return;
    }
    this.drainPromise = new Promise<void>((resolve) => {
      this.socket.once('drain', () => {
        this.drainPromise = null;
        if (this.sendBuffer.length > 0) {
          const remaining = this.sendBuffer;
          this.sendBuffer = '';
          this.send(remaining);
        }
        resolve();
      });
    });
  }

  waitForDrain(): Promise<void> {
    return this.drainPromise ?? Promise.resolve();
  }

  disconnect(): void {
    if (this.status === ConnectionStatus.DISCONNECTED) {
      return;
    }
    this.status = ConnectionStatus.DISCONNECTED;
    try {
      this.socket.end();
    } catch {
      this.socket.destroy();
    }
  }

  destroy(): void {
    this.status = ConnectionStatus.DISCONNECTED;
    this.socket.destroy();
  }
}
