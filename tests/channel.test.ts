import { describe, it, expect } from 'vitest';
import { Channel } from '../src/models/Channel.js';

describe('Channel', () => {
  it('should create a channel', () => {
    const channel = new Channel('#test');
    expect(channel.name).toBe('#test');
    expect(channel.userCount).toBe(0);
    expect(channel.topic).toBe('');
  });

  it('should manage users', () => {
    const channel = new Channel('#test');
    channel.addUser('user1');
    expect(channel.hasUser('user1')).toBe(true);
    expect(channel.userCount).toBe(1);
    channel.removeUser('user1');
    expect(channel.hasUser('user1')).toBe(false);
  });

  it('should manage user modes', () => {
    const channel = new Channel('#test');
    channel.addUser('user1');
    channel.addUserMode('user1', 'o');
    expect(channel.hasUserMode('user1', 'o')).toBe(true);
    channel.removeUserMode('user1', 'o');
    expect(channel.hasUserMode('user1', 'o')).toBe(false);
  });

  it('should set topic', () => {
    const channel = new Channel('#test');
    channel.setTopic('New topic', 'setter');
    expect(channel.topic).toBe('New topic');
    expect(channel.topicSetBy).toBe('setter');
    expect(channel.topicSetAt).toBeDefined();
  });

  it('should track operators', () => {
    const channel = new Channel('#test');
    channel.addUser('user1');
    expect(channel.hasOperator).toBe(false);
    channel.addUserMode('user1', 'o');
    expect(channel.hasOperator).toBe(true);
  });

  it('should list user nicknames', () => {
    const channel = new Channel('#test');
    channel.addUser('user1');
    channel.addUser('user2');
    expect(channel.userNicknames).toEqual(expect.arrayContaining(['user1', 'user2']));
  });

  it('should manage invite list', () => {
    const channel = new Channel('#test');
    channel.inviteList.add('user1');
    expect(channel.isInvited('user1')).toBe(true);
    expect(channel.isInvited('user2')).toBe(false);
  });
});
