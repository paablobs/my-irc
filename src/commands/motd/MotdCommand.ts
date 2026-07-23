import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class MotdCommand implements Command {
  readonly name = 'MOTD';
  readonly minParams = 0;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, _message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const serverName = context.state.server.config.serverName;
    const motd = context.state.server.config.motd;

    if (motd.length === 0) {
      context.send(serializeSimple(ERR.NOMOTD, [user.nickname], 'MOTD File is missing', serverName));
      return;
    }

    context.send(serializeSimple(RPL.MOTDSTART, [user.nickname], `- ${serverName} Message of the Day -`, serverName));
    for (const line of motd) {
      context.send(serializeSimple(RPL.MOTD, [user.nickname], `- ${line}`, serverName));
    }
    context.send(serializeSimple(RPL.ENDOFMOTD, [user.nickname], 'End of /MOTD command.', serverName));
  }
}
