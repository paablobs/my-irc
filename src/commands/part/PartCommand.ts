import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class PartCommand implements Command {
  readonly name = 'PART';
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
        serializeSimple(ERR.NEEDMOREPARAMS, ['PART'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    const reason = message.trailing;
    const channelNames = channelsParam.split(',');

    for (const channelName of channelNames) {
      await this.partChannel(context, user, channelName, reason);
    }
  }

  private async partChannel(
    context: CommandContext,
    user: { id: string; nickname: string; channels: Set<string>; hostmask: string },
    channelName: string,
    reason?: string,
  ): Promise<void> {
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

    channel.removeUser(user.nickname);
    user.channels.delete(channelName.toLowerCase());

    const partMessage = serializeSimple('PART', [channelName], reason, user.hostmask);

    for (const member of channel.userNicknames) {
      const memberUser = await context.state.users.findByNickname(member);
      if (memberUser) {
        const conn = await context.state.connections.findById(memberUser.connectionId);
        if (conn) {
          conn.send(partMessage);
        }
      }
    }

    context.send(partMessage);

    if (channel.userCount === 0) {
      await context.state.channels.delete(channelName);
      context.state.server.decrementChannelCount();
    }
  }
}
