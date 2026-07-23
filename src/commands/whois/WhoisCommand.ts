import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class WhoisCommand implements Command {
  readonly name = 'WHOIS';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const targetNick = message.getParam(0);
    if (!targetNick) {
      context.send(
        serializeSimple(ERR.NONICKNAMEGIVEN, [], 'No nickname given', context.state.server.config.serverName),
      );
      return;
    }

    const target = await context.state.users.findByNickname(targetNick);
    if (!target || target.state !== ConnectionState.REGISTERED) {
      context.send(
        serializeSimple(ERR.NOSUCHNICK, [targetNick], 'No such nick/channel', context.state.server.config.serverName),
      );
      return;
    }

    const serverName = context.state.server.config.serverName;
    const idleTime = Math.floor((Date.now() - target.lastActivity.getTime()) / 1000);

    context.send(
      serializeSimple(RPL.WHOISUSER, [user.nickname, target.nickname, target.username, target.hostname, '*'], target.realname, serverName),
    );
    context.send(
      serializeSimple(RPL.WHOISSERVER, [user.nickname, target.nickname, target.serverName], 'Server info', serverName),
    );

    if (target.hasMode('o')) {
      context.send(
        serializeSimple(RPL.WHOISOPERATOR, [user.nickname, target.nickname], 'is an IRC operator', serverName),
      );
    }

    context.send(
      serializeSimple(RPL.WHOISIDLE, [user.nickname, target.nickname, String(idleTime)], 'seconds idle', serverName),
    );

    if (target.channels.size > 0) {
      const channelNames = Array.from(target.channels).join(' ');
      context.send(
        serializeSimple(RPL.WHOISCHANNELS, [user.nickname, target.nickname], channelNames, serverName),
      );
    }

    context.send(
      serializeSimple(RPL.ENDOFWHOIS, [user.nickname, target.nickname], 'End of /WHOIS list.', serverName),
    );
  }
}
