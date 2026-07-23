import type { IRCMessage } from '../../models/IRCMessage.js';
import type { Connection } from '../../models/Connection.js';
import type { ServerStateContainer } from '../../state/serverState.js';

export interface CommandContext {
  readonly state: ServerStateContainer;
  readonly connection: Connection;
  send(data: string): void;
}

export interface Command {
  readonly name: string;
  readonly minParams: number;
  readonly requiresRegistration: boolean;
  execute(context: CommandContext, message: IRCMessage): Promise<void>;
}
