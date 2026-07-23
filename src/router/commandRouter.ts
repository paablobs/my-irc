import type { Command, CommandContext } from '../commands/base/Command.js';
import type { IRCMessage } from '../models/IRCMessage.js';
import { ERR } from '../protocol/numericReplies.js';
import { serializeSimple } from '../protocol/serializer.js';

export class CommandRouter {
  private readonly commands = new Map<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name.toUpperCase(), command);
  }

  unregister(name: string): boolean {
    return this.commands.delete(name.toUpperCase());
  }

  get(name: string): Command | undefined {
    return this.commands.get(name.toUpperCase());
  }

  has(name: string): boolean {
    return this.commands.has(name.toUpperCase());
  }

  getRegisteredCommands(): string[] {
    return Array.from(this.commands.keys());
  }

  async route(context: CommandContext, message: IRCMessage): Promise<void> {
    const command = this.commands.get(message.command);

    if (!command) {
      context.send(
        serializeSimple(ERR.UNKNOWNCOMMAND, [message.command], 'Unknown command', context.state.server.config.serverName),
      );
      return;
    }

    if (command.requiresRegistration && !context.connection.userId) {
      context.send(
        serializeSimple(ERR.NOTREGISTERED, [], 'You have not registered', context.state.server.config.serverName),
      );
      return;
    }

    if (message.paramCount < command.minParams) {
      context.send(
        serializeSimple(
          ERR.NEEDMOREPARAMS,
          [command.name],
          'Not enough parameters',
          context.state.server.config.serverName,
        ),
      );
      return;
    }

    try {
      await command.execute(context, message);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      context.send(
        serializeSimple(ERR.UNKNOWNCOMMAND, [command.name], `Internal error: ${errMsg}`, context.state.server.config.serverName),
      );
    }
  }
}
