import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class PrivmsgCommand implements Command {
  readonly name = 'PRIVMSG';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const target = message.getParam(0);
    const text = message.trailing;

    if (!target) {
      context.send(
        serializeSimple(ERR.NORECIPIENT, [], 'No recipient given (PRIVMSG)', context.state.server.config.serverName),
      );
      return;
    }

    if (text === undefined) {
      context.send(
        serializeSimple(ERR.NOTEXTTOSEND, [], 'No text to send', context.state.server.config.serverName),
      );
      return;
    }

    if (target.startsWith('#') || target.startsWith('&')) {
      await this.sendToChannel(context, user, target, text);
    } else {
      await this.sendToUser(context, user, target, text);
    }
  }

  private async sendToChannel(
    context: CommandContext,
    sender: { nickname: string; hostmask: string },
    channelName: string,
    text: string,
  ): Promise<void> {
    const channel = await context.state.channels.findByName(channelName);
    if (!channel) {
      context.send(
        serializeSimple(ERR.NOSUCHCHANNEL, [channelName], 'No such channel', context.state.server.config.serverName),
      );
      return;
    }

    if (!channel.hasUser(sender.nickname)) {
      context.send(
        serializeSimple(ERR.CANNOTSENDTOCHAN, [channelName], 'Cannot send to channel', context.state.server.config.serverName),
      );
      return;
    }

    const message = serializeSimple('PRIVMSG', [channelName], text, sender.hostmask);

    for (const member of channel.userNicknames) {
      if (member.toLowerCase() === sender.nickname.toLowerCase()) {
        continue;
      }
      const memberUser = await context.state.users.findByNickname(member);
      if (memberUser) {
        const conn = await context.state.connections.findById(memberUser.connectionId);
        if (conn) {
          conn.send(message);
        }
      }
    }
  }

  private async sendToUser(
    context: CommandContext,
    sender: { nickname: string; hostmask: string },
    targetNickname: string,
    text: string,
  ): Promise<void> {
    const target = await context.state.users.findByNickname(targetNickname);
    if (!target) {
      context.send(
        serializeSimple(ERR.NOSUCHNICK, [targetNickname], 'No such nick/channel', context.state.server.config.serverName),
      );
      return;
    }

    const conn = await context.state.connections.findById(target.connectionId);
    if (!conn) {
      context.send(
        serializeSimple(ERR.NOSUCHNICK, [targetNickname], 'No such nick/channel', context.state.server.config.serverName),
      );
      return;
    }

    conn.send(serializeSimple('PRIVMSG', [targetNickname], text, sender.hostmask));
  }
}
