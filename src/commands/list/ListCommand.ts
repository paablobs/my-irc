import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class ListCommand implements Command {
  readonly name = 'LIST';
  readonly minParams = 0;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const serverName = context.state.server.config.serverName;
    const channelsParam = message.getParam(0);

    context.send(serializeSimple(RPL.LISTSTART, [user.nickname], 'Channel', serverName));

    if (channelsParam) {
      const channelNames = channelsParam.split(',');
      for (const channelName of channelNames) {
        const channel = await context.state.channels.findByName(channelName);
        if (channel && !channel.modes.has('s')) {
          context.send(
            serializeSimple(
              RPL.LIST,
              [user.nickname, channel.name, String(channel.userCount)],
              channel.topic || 'No topic set',
              serverName,
            ),
          );
        }
      }
    } else {
      const channels = await context.state.channels.getAllChannels();
      for (const channel of channels) {
        if (!channel.modes.has('s')) {
          context.send(
            serializeSimple(
              RPL.LIST,
              [user.nickname, channel.name, String(channel.userCount)],
              channel.topic || 'No topic set',
              serverName,
            ),
          );
        }
      }
    }

    context.send(serializeSimple(RPL.LISTEND, [user.nickname], 'End of /LIST', serverName));
  }
}
