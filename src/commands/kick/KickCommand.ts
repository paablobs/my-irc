import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class KickCommand implements Command {
  readonly name = 'KICK';
  readonly minParams = 2;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const channelName = message.getParam(0);
    const targetNick = message.getParam(1);
    const reason = message.trailing ?? user.nickname;

    if (!channelName || !targetNick) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['KICK'], 'Not enough parameters', context.state.server.config.serverName),
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

    if (!channel.hasUserMode(user.nickname, 'o')) {
      context.send(
        serializeSimple(ERR.CHANOPRIVSNEEDED, [channelName], 'You\'re not channel operator', context.state.server.config.serverName),
      );
      return;
    }

    const target = await context.state.users.findByNickname(targetNick);
    if (!target) {
      context.send(
        serializeSimple(ERR.USERNOTINCHANNEL, [targetNick, channelName], 'They aren\'t on that channel', context.state.server.config.serverName),
      );
      return;
    }

    if (!channel.hasUser(target.nickname)) {
      context.send(
        serializeSimple(ERR.USERNOTINCHANNEL, [targetNick, channelName], 'They aren\'t on that channel', context.state.server.config.serverName),
      );
      return;
    }

    const kickMessage = serializeSimple('KICK', [channelName, target.nickname], reason, user.hostmask);

    for (const member of channel.userNicknames) {
      const memberUser = await context.state.users.findByNickname(member);
      if (memberUser) {
        const conn = await context.state.connections.findById(memberUser.connectionId);
        if (conn) {
          conn.send(kickMessage);
        }
      }
    }

    channel.removeUser(target.nickname);
    target.removeChannel(channelName);

    if (channel.userCount === 0) {
      await context.state.channels.delete(channelName);
      context.state.server.decrementChannelCount();
    }
  }
}
