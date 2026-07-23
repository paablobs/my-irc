import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';

export class PongCommand implements Command {
  readonly name = 'PONG';
  readonly minParams = 1;
  readonly requiresRegistration = false;

  async execute(context: CommandContext, _message: IRCMessage): Promise<void> {
    if (context.connection.userId) {
      const user = await context.state.users.findById(context.connection.userId);
      if (user) {
        user.touch();
      }
    }
  }
}
