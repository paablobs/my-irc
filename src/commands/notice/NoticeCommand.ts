import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { ConnectionState } from '../../models/User.js';

export class NoticeCommand implements Command {
  readonly name = 'NOTICE';
  readonly minParams = 2;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const target = message.getParam(0);
    const text = message.trailing;

    if (!target || text === undefined) {
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
      return;
    }

    if (!channel.hasUser(sender.nickname)) {
      return;
    }

    const message = serializeSimple('NOTICE', [channelName], text, sender.hostmask);

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
      return;
    }

    const conn = await context.state.connections.findById(target.connectionId);
    if (!conn) {
      return;
    }

    conn.send(serializeSimple('NOTICE', [targetNickname], text, sender.hostmask));
  }
}
