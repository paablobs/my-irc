import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class NamesCommand implements Command {
  readonly name = 'NAMES';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const channelsParam = message.getParam(0);
    if (!channelsParam) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['NAMES'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    const serverName = context.state.server.config.serverName;
    const channelNames = channelsParam.split(',');

    for (const channelName of channelNames) {
      const channel = await context.state.channels.findByName(channelName);
      if (!channel) {
        context.send(
          serializeSimple(RPL.ENDOFNAMES, [user.nickname, channelName], 'End of /NAMES list.', serverName),
        );
        continue;
      }

      const names: string[] = [];
      for (const member of channel.userNicknames) {
        const memberUser = await context.state.users.findByNickname(member);
        if (memberUser) {
          const modes = channel.getUserModes(member);
          let prefix = '';
          if (modes.has('o')) prefix = '@';
          else if (modes.has('v')) prefix = '+';
          names.push(`${prefix}${member}`);
        }
      }

      const namesStr = names.join(' ');
      context.send(
        serializeSimple(RPL.NAMREPLY, [user.nickname, '=', channel.name], namesStr, serverName),
      );
      context.send(
        serializeSimple(RPL.ENDOFNAMES, [user.nickname, channel.name], 'End of /NAMES list.', serverName),
      );
    }
  }
}
