import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class TopicCommand implements Command {
  readonly name = 'TOPIC';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const channelName = message.getParam(0);
    if (!channelName) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['TOPIC'], 'Not enough parameters', context.state.server.config.serverName),
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

    const newTopic = message.trailing;
    if (newTopic === undefined) {
      if (channel.topic) {
        context.send(
          serializeSimple(RPL.TOPIC, [user.nickname, channelName], channel.topic, context.state.server.config.serverName),
        );
        if (channel.topicSetBy && channel.topicSetAt) {
          context.send(
            serializeSimple(
              RPL.TOPIC,
              [user.nickname, channelName, channel.topicSetBy, String(Math.floor(channel.topicSetAt.getTime() / 1000))],
              undefined,
              context.state.server.config.serverName,
            ),
          );
        }
      } else {
        context.send(
          serializeSimple(RPL.NOTOPIC, [user.nickname, channelName], 'No topic is set.', context.state.server.config.serverName),
        );
      }
      return;
    }

    if (channel.modes.has('t') && !channel.hasUserMode(user.nickname, 'o')) {
      context.send(
        serializeSimple(ERR.CHANOPRIVSNEEDED, [channelName], 'You\'re not channel operator', context.state.server.config.serverName),
      );
      return;
    }

    channel.setTopic(newTopic, user.nickname);

    const topicMessage = serializeSimple('TOPIC', [channelName], newTopic, user.hostmask);
    for (const member of channel.userNicknames) {
      const memberUser = await context.state.users.findByNickname(member);
      if (memberUser) {
        const conn = await context.state.connections.findById(memberUser.connectionId);
        if (conn) {
          conn.send(topicMessage);
        }
      }
    }
  }
}
