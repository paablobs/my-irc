import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';

export class PingCommand implements Command {
  readonly name = 'PING';
  readonly minParams = 1;
  readonly requiresRegistration = false;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const token = message.getParam(0) ?? '';
    context.send(serializeSimple('PONG', [token], undefined, context.state.server.config.serverName));
  }
}
