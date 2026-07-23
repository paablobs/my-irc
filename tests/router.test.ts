import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRouter } from '../src/router/commandRouter.js';
import type { Command, CommandContext } from '../src/commands/base/Command.js';
import type { IRCMessage } from '../src/models/IRCMessage.js';

describe('CommandRouter', () => {
  let router: CommandRouter;

  beforeEach(() => {
    router = new CommandRouter();
  });

  it('should register and retrieve commands', () => {
    const command: Command = {
      name: 'TEST',
      minParams: 0,
      requiresRegistration: false,
      execute: async () => {},
    };

    router.register(command);
    expect(router.has('TEST')).toBe(true);
    expect(router.get('TEST')).toBe(command);
  });

  it('should unregister commands', () => {
    const command: Command = {
      name: 'TEST',
      minParams: 0,
      requiresRegistration: false,
      execute: async () => {},
    };

    router.register(command);
    expect(router.has('TEST')).toBe(true);

    router.unregister('TEST');
    expect(router.has('TEST')).toBe(false);
  });

  it('should list registered commands', () => {
    router.register({
      name: 'CMD1',
      minParams: 0,
      requiresRegistration: false,
      execute: async () => {},
    });
    router.register({
      name: 'CMD2',
      minParams: 0,
      requiresRegistration: false,
      execute: async () => {},
    });

    const commands = router.getRegisteredCommands();
    expect(commands).toContain('CMD1');
    expect(commands).toContain('CMD2');
  });

  it('should be case insensitive', () => {
    const command: Command = {
      name: 'TEST',
      minParams: 0,
      requiresRegistration: false,
      execute: async () => {},
    };

    router.register(command);
    expect(router.has('test')).toBe(true);
    expect(router.has('Test')).toBe(true);
    expect(router.has('TEST')).toBe(true);
  });
});
