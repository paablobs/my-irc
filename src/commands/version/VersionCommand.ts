import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class VersionCommand implements Command {
  readonly name = 'VERSION';
  readonly minParams = 0;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, _message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const serverName = context.state.server.config.serverName;
    const version = context.state.server.config.version;

    context.send(
      serializeSimple(RPL.VERSION, [user.nickname, `${version}.${serverName}`], serverName, serverName),
    );
  }
}
