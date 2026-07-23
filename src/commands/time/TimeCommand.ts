import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class TimeCommand implements Command {
  readonly name = 'TIME';
  readonly minParams = 0;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, _message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const serverName = context.state.server.config.serverName;
    const now = new Date();
    const timeStr = now.toISOString();

    context.send(
      serializeSimple(RPL.TIME, [user.nickname, serverName], timeStr, serverName),
    );
  }
}
