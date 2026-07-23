import { describe, it, expect } from 'vitest';
import { serialize, serializeSimple, serializeNumeric } from '../src/protocol/serializer.js';
import { IRCMessage } from '../src/models/IRCMessage.js';

describe('Serializer', () => {
  it('should serialize a simple message', () => {
    const msg = new IRCMessage({
      command: 'PING',
      parameters: [],
      trailing: 'server',
    });
    expect(serialize(msg)).toBe('PING :server\r\n');
  });

  it('should serialize message with prefix', () => {
    const msg = new IRCMessage({
      prefix: 'nick!user@host',
      command: 'PRIVMSG',
      parameters: ['#channel'],
      trailing: 'Hello',
    });
    expect(serialize(msg)).toBe(':nick!user@host PRIVMSG #channel :Hello\r\n');
  });

  it('should serialize message with tags', () => {
    const msg = new IRCMessage({
      tags: new Map([['id', '123']]),
      command: 'PRIVMSG',
      parameters: ['#channel'],
      trailing: 'Hello',
    });
    expect(serialize(msg)).toBe('@id=123 PRIVMSG #channel :Hello\r\n');
  });

  it('should serialize with serializeSimple', () => {
    const result = serializeSimple('PRIVMSG', ['#channel'], 'Hello', 'nick!user@host');
    expect(result).toBe(':nick!user@host PRIVMSG #channel :Hello\r\n');
  });

  it('should serialize numeric reply', () => {
    const result = serializeNumeric('server', 'nick', '001', [], 'Welcome');
    expect(result).toBe(':server 001 nick :Welcome\r\n');
  });

  it('should escape tag values', () => {
    const msg = new IRCMessage({
      tags: new Map([['key', 'value with spaces;semi;colons']]),
      command: 'TEST',
      parameters: [],
    });
    const serialized = serialize(msg);
    expect(serialized).toContain('value\\swith\\sspaces\\:semi\\:colons');
  });
});
