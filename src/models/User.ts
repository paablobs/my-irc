export enum ConnectionState {
  CONNECTED = 'connected',
  REGISTERING = 'registering',
  REGISTERED = 'registered',
  DISCONNECTED = 'disconnected',
}

export interface UserState {
  readonly id: string;
  readonly connectionId: string;
  nickname: string;
  username: string;
  hostname: string;
  realname: string;
  readonly serverName: string;
  readonly connectedAt: Date;
  state: ConnectionState;
  modes: Set<string>;
  channels: Set<string>;
  awayMessage?: string;
  lastActivity: Date;
}

export class User implements UserState {
  readonly id: string;
  readonly connectionId: string;
  nickname: string;
  username: string;
  hostname: string;
  realname: string;
  readonly serverName: string;
  readonly connectedAt: Date;
  state: ConnectionState;
  modes: Set<string>;
  channels: Set<string>;
  awayMessage?: string;
  lastActivity: Date;

  constructor(params: {
    id: string;
    connectionId: string;
    nickname: string;
    hostname: string;
    serverName: string;
  }) {
    this.id = params.id;
    this.connectionId = params.connectionId;
    this.nickname = params.nickname;
    this.username = '';
    this.hostname = params.hostname;
    this.realname = '';
    this.serverName = params.serverName;
    this.connectedAt = new Date();
    this.state = ConnectionState.CONNECTED;
    this.modes = new Set();
    this.channels = new Set();
    this.lastActivity = new Date();
  }

  get isRegistered(): boolean {
    return this.state === ConnectionState.REGISTERED;
  }

  get hostmask(): string {
    return `${this.nickname}!${this.username}@${this.hostname}`;
  }

  get isAway(): boolean {
    return this.awayMessage !== undefined;
  }

  touch(): void {
    this.lastActivity = new Date();
  }

  addChannel(channel: string): void {
    this.channels.add(channel.toLowerCase());
  }

  removeChannel(channel: string): void {
    this.channels.delete(channel.toLowerCase());
  }

  hasMode(mode: string): boolean {
    return this.modes.has(mode);
  }

  addMode(mode: string): void {
    this.modes.add(mode);
  }

  removeMode(mode: string): void {
    this.modes.delete(mode);
  }
}
