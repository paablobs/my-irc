import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';

export class QuitCommand implements Command {
  readonly name = 'QUIT';
  readonly minParams = 0;
  readonly requiresRegistration = false;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const reason = message.trailing ?? 'Quit';

    if (context.connection.userId) {
      const user = await context.state.users.findById(context.connection.userId);
      if (user) {
        const quitMessage = serializeSimple('QUIT', [], `${user.hostmask} has quit: ${reason}`, user.hostmask);

        for (const channelName of user.channels) {
          const channel = await context.state.channels.findByName(channelName);
          if (channel) {
            for (const member of channel.userNicknames) {
              if (member.toLowerCase() !== user.nickname.toLowerCase()) {
                const memberUser = await context.state.users.findByNickname(member);
                if (memberUser) {
                  const conn = await context.state.connections.findById(memberUser.connectionId);
                  if (conn) {
                    conn.send(quitMessage);
                  }
                }
              }
            }
            channel.removeUser(user.nickname);
            if (channel.userCount === 0) {
              await context.state.channels.delete(channelName);
              context.state.server.decrementChannelCount();
            }
          }
        }

        await context.state.users.delete(user.id);
        context.state.server.decrementUserCount();
      }
    }

    context.send(serializeSimple('ERROR', [], `Closing Link: ${context.connection.remoteAddress} (Quit)`));
    context.connection.disconnect();
  }
}
