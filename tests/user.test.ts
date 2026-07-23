import { describe, it, expect } from 'vitest';
import { User, ConnectionState } from '../src/models/User.js';

describe('User', () => {
  const createUser = (overrides?: Partial<ConstructorParameters<typeof User>[0]>) => {
    return new User({
      id: 'test-id',
      connectionId: 'conn-1',
      nickname: 'testuser',
      hostname: 'localhost',
      serverName: 'test.server',
      ...overrides,
    });
  };

  it('should create a user with defaults', () => {
    const user = createUser();
    expect(user.id).toBe('test-id');
    expect(user.nickname).toBe('testuser');
    expect(user.state).toBe(ConnectionState.CONNECTED);
    expect(user.modes.size).toBe(0);
    expect(user.channels.size).toBe(0);
  });

  it('should generate hostmask', () => {
    const user = createUser();
    user.username = 'user';
    expect(user.hostmask).toBe('testuser!user@localhost');
  });

  it('should track channels', () => {
    const user = createUser();
    user.addChannel('#test');
    expect(user.channels.has('#test')).toBe(true);
    user.removeChannel('#test');
    expect(user.channels.has('#test')).toBe(false);
  });

  it('should track modes', () => {
    const user = createUser();
    user.addMode('o');
    expect(user.hasMode('o')).toBe(true);
    user.removeMode('o');
    expect(user.hasMode('o')).toBe(false);
  });

  it('should track away status', () => {
    const user = createUser();
    expect(user.isAway).toBe(false);
    user.awayMessage = 'Gone fishing';
    expect(user.isAway).toBe(true);
  });

  it('should update last activity', () => {
    const user = createUser();
    const before = user.lastActivity;
    user.touch();
    expect(user.lastActivity.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
