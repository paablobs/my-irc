import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class WhoCommand implements Command {
  readonly name = 'WHO';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const target = message.getParam(0);
    if (!target) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['WHO'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    const serverName = context.state.server.config.serverName;

    if (target.startsWith('#') || target.startsWith('&')) {
      const channel = await context.state.channels.findByName(target);
      if (!channel) {
        context.send(
          serializeSimple(RPL.ENDOFWHO, [user.nickname, target], 'End of /WHO list.', serverName),
        );
        return;
      }

      for (const member of channel.userNicknames) {
        const memberUser = await context.state.users.findByNickname(member);
        if (memberUser) {
          const modes = channel.getUserModes(member);
          let flags = 'H';
          if (memberUser.isAway) flags = 'G';
          if (modes.has('o')) flags += '@';
          else if (modes.has('v')) flags += '+';

          context.send(
            serializeSimple(
              RPL.WHOREPLY,
              [user.nickname, target, memberUser.username, memberUser.hostname, serverName, memberUser.nickname, flags],
              memberUser.realname,
              serverName,
            ),
          );
        }
      }
    } else {
      const targetUser = await context.state.users.findByNickname(target);
      if (targetUser && targetUser.state === ConnectionState.REGISTERED) {
        let flags = 'H';
        if (targetUser.isAway) flags = 'G';
        if (targetUser.hasMode('o')) flags += '*';

        context.send(
          serializeSimple(
            RPL.WHOREPLY,
            [user.nickname, '*', targetUser.username, targetUser.hostname, serverName, targetUser.nickname, flags],
            targetUser.realname,
            serverName,
          ),
        );
      }
    }

    context.send(
      serializeSimple(RPL.ENDOFWHO, [user.nickname, target], 'End of /WHO list.', serverName),
    );
  }
}
