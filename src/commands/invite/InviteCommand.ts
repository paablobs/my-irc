import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class InviteCommand implements Command {
  readonly name = 'INVITE';
  readonly minParams = 2;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const targetNick = message.getParam(0);
    const channelName = message.getParam(1);

    if (!targetNick || !channelName) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['INVITE'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    const target = await context.state.users.findByNickname(targetNick);
    if (!target) {
      context.send(
        serializeSimple(ERR.NOSUCHNICK, [targetNick], 'No such nick/channel', context.state.server.config.serverName),
      );
      return;
    }

    const channel = await context.state.channels.findByName(channelName);
    if (!channel) {
      context.send(
        serializeSimple(ERR.NOSUCHCHANNEL, [channelName], 'No such channel', context.state.server.config.serverName),
      );
      return;
    }

    if (!channel.hasUser(user.nickname)) {
      context.send(
        serializeSimple(ERR.NOTONCHANNEL, [channelName], 'You\'re not on that channel', context.state.server.config.serverName),
      );
      return;
    }

    if (channel.hasUser(target.nickname)) {
      context.send(
        serializeSimple(ERR.USERONCHANNEL, [targetNick, channelName], 'is already on channel', context.state.server.config.serverName),
      );
      return;
    }

    channel.inviteList.add(target.nickname.toLowerCase());

    context.send(
      serializeSimple(RPL.INVITING, [user.nickname, targetNick, channelName], undefined, context.state.server.config.serverName),
    );

    const targetConn = await context.state.connections.findById(target.connectionId);
    if (targetConn) {
      targetConn.send(
        serializeSimple('INVITE', [targetNick, channelName], undefined, user.hostmask),
      );
    }
  }
}
