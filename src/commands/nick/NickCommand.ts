import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';

export class NickCommand implements Command {
  readonly name = 'NICK';
  readonly minParams = 1;
  readonly requiresRegistration = false;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const nickname = message.getParam(0);
    if (!nickname) {
      context.send(
        serializeSimple(ERR.NONICKNAMEGIVEN, [], 'No nickname given', context.state.server.config.serverName),
      );
      return;
    }

    if (nickname.length > context.state.server.config.maxNickLength) {
      context.send(
        serializeSimple(
          ERR.ERRONEUSNICKNAME,
          [nickname],
          'Nickname too long',
          context.state.server.config.serverName,
        ),
      );
      return;
    }

    if (!/^[a-zA-Z\[\]\\`_^{|}][a-zA-Z0-9\[\]\\`_^{|}-]*$/.test(nickname)) {
      context.send(
        serializeSimple(
          ERR.ERRONEUSNICKNAME,
          [nickname],
          'Erroneous nickname',
          context.state.server.config.serverName,
        ),
      );
      return;
    }

    const existingUser = await context.state.users.findByNickname(nickname);
    if (existingUser && existingUser.connectionId !== context.connection.id) {
      context.send(
        serializeSimple(
          ERR.NICKNAMEINUSE,
          [nickname],
          'Nickname is already in use',
          context.state.server.config.serverName,
        ),
      );
      return;
    }

    if (context.connection.userId) {
      const user = await context.state.users.findById(context.connection.userId);
      if (user) {
        const oldHostmask = user.hostmask;
        user.nickname = nickname;
        await context.state.users.save(user);

        context.send(serializeSimple('NICK', [nickname], undefined, oldHostmask));

        for (const channelName of user.channels) {
          const channel = await context.state.channels.findByName(channelName);
          if (channel) {
            for (const member of channel.userNicknames) {
              if (member.toLowerCase() !== nickname.toLowerCase()) {
                const memberUser = await context.state.users.findByNickname(member);
                if (memberUser) {
                  const conn = await context.state.connections.findById(memberUser.connectionId);
                  if (conn) {
                    conn.send(serializeSimple('NICK', [nickname], undefined, oldHostmask));
                  }
                }
              }
            }
          }
        }
      }
    } else {
      const user = await context.state.users.createUser({
        connectionId: context.connection.id,
        nickname,
        hostname: context.connection.remoteAddress,
        serverName: context.state.server.config.serverName,
      });
      context.connection.userId = user.id;
      if (user.username) {
        await this.sendWelcome(context, user.nickname);
      }
    }
  }

  private async sendWelcome(context: CommandContext, nickname: string): Promise<void> {
    const serverName = context.state.server.config.serverName;
    const serverVersion = context.state.server.config.version;

    context.send(
      serializeSimple(RPL.WELCOME, [nickname], `Welcome to the Internet Relay Network ${nickname}`, serverName),
    );
    context.send(
      serializeSimple(RPL.YOURHOST, [nickname], `Your host is ${serverName}, running version ${serverVersion}`, serverName),
    );
    context.send(
      serializeSimple(
        RPL.CREATED,
        [nickname],
        `This server was created ${context.state.server.config.created.toISOString()}`,
        serverName,
      ),
    );
    context.send(
      serializeSimple(
        RPL.MYINFO,
        [nickname],
        `${serverName} ${serverVersion} o o`,
        serverName,
      ),
    );

    await this.sendMotd(context, nickname);
  }

  private async sendMotd(context: CommandContext, nickname: string): Promise<void> {
    const serverName = context.state.server.config.serverName;
    const motd = context.state.server.config.motd;

    if (motd.length === 0) {
      context.send(serializeSimple(ERR.NOMOTD, [nickname], 'MOTD File is missing', serverName));
      return;
    }

    context.send(serializeSimple(RPL.MOTDSTART, [nickname], `- ${serverName} Message of the Day -`, serverName));
    for (const line of motd) {
      context.send(serializeSimple(RPL.MOTD, [nickname], `- ${line}`, serverName));
    }
    context.send(serializeSimple(RPL.ENDOFMOTD, [nickname], 'End of /MOTD command.', serverName));
  }
}
