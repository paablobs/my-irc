export interface ServerConfig {
  readonly port: number;
  readonly hostname: string;
  readonly serverName: string;
  readonly serverDescription: string;
  readonly motd: string[];
  readonly maxConnections: number;
  readonly maxChannelsPerUser: number;
  readonly maxNickLength: number;
  readonly maxChannelNameLength: number;
  readonly pingTimeout: number;
  readonly pingInterval: number;
  readonly registrationTimeout: number;
  readonly version: string;
  readonly created: Date;
}

export interface ServerState {
  readonly config: ServerConfig;
  readonly startedAt: Date;
  connectionCount: number;
  userCount: number;
  channelCount: number;
  operatorCount: number;
  maxSeenUsers: number;
  totalConnections: number;
  bytesReceived: number;
  bytesSent: number;
}

export class Server implements ServerState {
  readonly config: ServerConfig;
  readonly startedAt: Date;
  connectionCount: number;
  userCount: number;
  channelCount: number;
  operatorCount: number;
  maxSeenUsers: number;
  totalConnections: number;
  bytesReceived: number;
  bytesSent: number;

  constructor(config: ServerConfig) {
    this.config = config;
    this.startedAt = new Date();
    this.connectionCount = 0;
    this.userCount = 0;
    this.channelCount = 0;
    this.operatorCount = 0;
    this.maxSeenUsers = 0;
    this.totalConnections = 0;
    this.bytesReceived = 0;
    this.bytesSent = 0;
  }

  get uptime(): number {
    return Date.now() - this.startedAt.getTime();
  }

  get uptimeFormatted(): string {
    const seconds = Math.floor(this.uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }

  incrementConnectionCount(): void {
    this.connectionCount++;
    this.totalConnections++;
  }

  decrementConnectionCount(): void {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
  }

  incrementUserCount(): void {
    this.userCount++;
    if (this.userCount > this.maxSeenUsers) {
      this.maxSeenUsers = this.userCount;
    }
  }

  decrementUserCount(): void {
    this.userCount = Math.max(0, this.userCount - 1);
  }

  incrementChannelCount(): void {
    this.channelCount++;
  }

  decrementChannelCount(): void {
    this.channelCount = Math.max(0, this.channelCount - 1);
  }
}
