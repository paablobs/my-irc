import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class UserCommand implements Command {
  readonly name = 'USER';
  readonly minParams = 4;
  readonly requiresRegistration = false;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    if (context.connection.userId) {
      const user = await context.state.users.findById(context.connection.userId);
      if (user && user.state === ConnectionState.REGISTERED) {
        context.send(
          serializeSimple(ERR.ALREADYREGISTRED, [], 'You may not reregister', context.state.server.config.serverName),
        );
        return;
      }
    }

    const username = message.getParam(0);
    const realname = message.getParam(3);

    if (!username || !realname) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['USER'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    if (!context.connection.userId) {
      context.send(
        serializeSimple(ERR.NONICKNAMEGIVEN, [], 'No nickname given', context.state.server.config.serverName),
      );
      return;
    }

    const user = await context.state.users.findById(context.connection.userId);
    if (!user) {
      return;
    }

    user.username = username;
    user.realname = realname;
    user.state = ConnectionState.REGISTERED;
    await context.state.users.save(user);

    await this.sendWelcome(context, user.nickname);
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
