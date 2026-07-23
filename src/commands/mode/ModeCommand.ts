import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class ModeCommand implements Command {
  readonly name = 'MODE';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const target = message.getParam(0);
    if (!target) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['MODE'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    if (target.startsWith('#') || target.startsWith('&')) {
      await this.handleChannelMode(context, user, message);
    } else {
      await this.handleUserMode(context, user, message);
    }
  }

  private async handleChannelMode(
    context: CommandContext,
    user: { nickname: string; hostmask: string },
    message: IRCMessage,
  ): Promise<void> {
    const channelName = message.getParam(0)!;
    const channel = await context.state.channels.findByName(channelName);

    if (!channel) {
      context.send(
        serializeSimple(ERR.NOSUCHCHANNEL, [channelName], 'No such channel', context.state.server.config.serverName),
      );
      return;
    }

    const modeStr = message.getParam(1);
    if (!modeStr) {
      const modes = Array.from(channel.modes.keys()).join('');
      const modeParams = Array.from(channel.modes.entries())
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${k} ${v}`)
        .join(' ');

      context.send(
        serializeSimple(
          RPL.CHANNELMODEIS,
          [user.nickname, channelName, `+${modes}`],
          modeParams || undefined,
          context.state.server.config.serverName,
        ),
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

    const modes = message.allParams.slice(1).join(' ');
    await this.parseAndApplyModes(context, channel, user, modes);
  }

  private async parseAndApplyModes(
    _context: CommandContext,
    channel: { name: string; modes: Map<string, string | undefined>; userNicknames: string[]; getUserModes: (nick: string) => Set<string>; hasUserMode: (nick: string, mode: string) => boolean; addUserMode: (nick: string, mode: string) => void; removeUserMode: (nick: string, mode: string) => void },
    _user: { nickname: string; hostmask: string },
    modesStr: string,
  ): Promise<void> {
    const parts = modesStr.split(/\s+/);
    let adding = true;
    let paramIndex = 1;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      for (const char of part) {
        if (char === '+') {
          adding = true;
          continue;
        }
        if (char === '-') {
          adding = false;
          continue;
        }

        switch (char) {
          case 'o': {
            const param = parts[paramIndex++];
            if (!param) continue;
            if (adding) {
              channel.addUserMode(param, 'o');
            } else {
              channel.removeUserMode(param, 'o');
            }
            break;
          }
          case 'v': {
            const param = parts[paramIndex++];
            if (!param) continue;
            if (adding) {
              channel.addUserMode(param, 'v');
            } else {
              channel.removeUserMode(param, 'v');
            }
            break;
          }
          case 'k': {
            if (adding) {
              const param = parts[paramIndex++];
              if (!param) continue;
              channel.modes.set('k', param);
            } else {
              channel.modes.delete('k');
            }
            break;
          }
          case 'l': {
            if (adding) {
              const param = parts[paramIndex++];
              if (!param) continue;
              channel.modes.set('l', param);
            } else {
              channel.modes.delete('l');
            }
            break;
          }
          case 'b': {
            const param = parts[paramIndex++];
            if (!param) continue;
            break;
          }
          case 'i':
          case 'm':
          case 'n':
          case 'p':
          case 's':
          case 't': {
            if (adding) {
              channel.modes.set(char, undefined);
            } else {
              channel.modes.delete(char);
            }
            break;
          }
        }
      }
    }
  }

  private async handleUserMode(
    context: CommandContext,
    user: { nickname: string; hostmask: string; modes: Set<string> },
    message: IRCMessage,
  ): Promise<void> {
    const targetNick = message.getParam(0)!;
    const target = await context.state.users.findByNickname(targetNick);

    if (!target) {
      context.send(
        serializeSimple(ERR.NOSUCHNICK, [targetNick], 'No such nick/channel', context.state.server.config.serverName),
      );
      return;
    }

    if (target.nickname !== user.nickname) {
      context.send(
        serializeSimple(ERR.USERSDONTMATCH, [], 'Cannot change mode for other users', context.state.server.config.serverName),
      );
      return;
    }

    const modeStr = message.getParam(1);
    if (!modeStr) {
      const modes = Array.from(user.modes).join('');
      context.send(
        serializeSimple(RPL.UMODEIS, [user.nickname, `+${modes}`], undefined, context.state.server.config.serverName),
      );
      return;
    }

    let adding = true;
    for (const char of modeStr) {
      if (char === '+') {
        adding = true;
        continue;
      }
      if (char === '-') {
        adding = false;
        continue;
      }

      if (char === 'o' && !adding) {
        user.modes.delete('o');
      } else if (char === 'i' || char === 'w' || char === 's' || char === 'o') {
        if (adding) {
          user.modes.add(char);
        } else {
          user.modes.delete(char);
        }
      } else {
        context.send(
          serializeSimple(ERR.UMODEUNKNOWNFLAG, [char], 'Unknown mode flag', context.state.server.config.serverName),
        );
      }
    }
  }
}
