export enum ChannelMode {
  OPER = 'o',
  VOICE = 'v',
  PRIVATE = 'p',
  SECRET = 's',
  INVITE_ONLY = 'i',
  MODERATED = 'm',
  NO_EXTERNAL = 'n',
  TOPIC_LOCK = 't',
  KEY = 'k',
  USER_LIMIT = 'l',
  BAN = 'b',
  EXCEPT = 'e',
  INVITE_EXCEPT = 'I',
}

export interface ChannelState {
  readonly name: string;
  readonly createdAt: Date;
  topic: string;
  topicSetBy?: string;
  topicSetAt?: Date;
  modes: Map<string, string | undefined>;
  users: Map<string, Set<string>>;
  banList: Map<string, { mask: string; setBy: string; setAt: Date }>;
  inviteList: Set<string>;
  exceptList: Map<string, { mask: string; setBy: string; setAt: Date }>;
}

export class Channel implements ChannelState {
  readonly name: string;
  readonly createdAt: Date;
  topic: string;
  topicSetBy?: string;
  topicSetAt?: Date;
  modes: Map<string, string | undefined>;
  users: Map<string, Set<string>>;
  banList: Map<string, { mask: string; setBy: string; setAt: Date }>;
  inviteList: Set<string>;
  exceptList: Map<string, { mask: string; setBy: string; setAt: Date }>;

  constructor(name: string) {
    this.name = name;
    this.createdAt = new Date();
    this.topic = '';
    this.modes = new Map();
    this.users = new Map();
    this.banList = new Map();
    this.inviteList = new Set();
    this.exceptList = new Map();
  }

  get userCount(): number {
    return this.users.size;
  }

  get userNicknames(): string[] {
    return Array.from(this.users.keys());
  }

  hasUser(nickname: string): boolean {
    return this.users.has(nickname.toLowerCase());
  }

  addUser(nickname: string): void {
    if (!this.users.has(nickname.toLowerCase())) {
      this.users.set(nickname.toLowerCase(), new Set());
    }
  }

  removeUser(nickname: string): boolean {
    return this.users.delete(nickname.toLowerCase());
  }

  getUserModes(nickname: string): Set<string> {
    return this.users.get(nickname.toLowerCase()) ?? new Set();
  }

  setUserModes(nickname: string, modes: Set<string>): void {
    this.users.set(nickname.toLowerCase(), modes);
  }

  hasUserMode(nickname: string, mode: string): boolean {
    const userModes = this.users.get(nickname.toLowerCase());
    return userModes?.has(mode) ?? false;
  }

  addUserMode(nickname: string, mode: string): void {
    const userModes = this.users.get(nickname.toLowerCase());
    if (userModes) {
      userModes.add(mode);
    }
  }

  removeUserMode(nickname: string, mode: string): void {
    const userModes = this.users.get(nickname.toLowerCase());
    if (userModes) {
      userModes.delete(mode);
    }
  }

  get hasOperator(): boolean {
    for (const modes of this.users.values()) {
      if (modes.has(ChannelMode.OPER)) {
        return true;
      }
    }
    return false;
  }

  setTopic(topic: string, setBy: string): void {
    this.topic = topic;
    this.topicSetBy = setBy;
    this.topicSetAt = new Date();
  }

  isBanned(hostmask: string): boolean {
    for (const ban of this.banList.values()) {
      if (this.matchesBanMask(hostmask, ban.mask)) {
        return true;
      }
    }
    return false;
  }

  isInvited(nickname: string): boolean {
    return this.inviteList.has(nickname.toLowerCase());
  }

  isExcepted(hostmask: string): boolean {
    for (const except of this.exceptList.values()) {
      if (this.matchesBanMask(hostmask, except.mask)) {
        return true;
      }
    }
    return false;
  }

  private matchesBanMask(hostmask: string, mask: string): boolean {
    const regexStr = mask
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexStr}$`, 'i');
    return regex.test(hostmask);
  }
}
