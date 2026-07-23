import type { User } from '../models/User.js';
import type { ServerStateContainer } from '../state/serverState.js';
import { serializeSimple } from '../protocol/serializer.js';
import { ERR } from '../protocol/numericReplies.js';

export class MessageService {
  constructor(private readonly state: ServerStateContainer) {}

  async sendToUser(
    sender: User,
    targetNickname: string,
    text: string,
    command: string = 'PRIVMSG',
  ): Promise<{ success: boolean; error?: string }> {
    const target = await this.state.users.findByNickname(targetNickname);
    if (!target) {
      return { success: false, error: ERR.NOSUCHNICK };
    }

    const connection = await this.state.connections.findById(target.connectionId);
    if (!connection) {
      return { success: false, error: ERR.NOSUCHNICK };
    }

    const message = serializeSimple(command, [], text, sender.hostmask);
    connection.send(message);

    return { success: true };
  }

  async sendToChannel(
    sender: User,
    channelName: string,
    text: string,
    command: string = 'PRIVMSG',
  ): Promise<{ success: boolean; error?: string }> {
    const channel = await this.state.channels.findByName(channelName);
    if (!channel) {
      return { success: false, error: ERR.NOSUCHCHANNEL };
    }

    if (!channel.hasUser(sender.nickname)) {
      return { success: false, error: ERR.CANNOTSENDTOCHAN };
    }

    const message = serializeSimple(command, [channelName], text, sender.hostmask);

    for (const nickname of channel.userNicknames) {
      if (nickname.toLowerCase() === sender.nickname.toLowerCase()) {
        continue;
      }
      const user = await this.state.users.findByNickname(nickname);
      if (user) {
        const connection = await this.state.connections.findById(user.connectionId);
        if (connection) {
          connection.send(message);
        }
      }
    }

    return { success: true };
  }
}
