import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/protocol/tokenizer.js';

describe('Tokenizer', () => {
  it('should parse a simple command', () => {
    const result = tokenize('PING :server');
    expect(result.command).toBe('PING');
    expect(result.trailing).toBe('server');
    expect(result.parameters).toEqual([]);
  });

  it('should parse command with parameters', () => {
    const result = tokenize('NICK newnick');
    expect(result.command).toBe('NICK');
    expect(result.parameters).toEqual(['newnick']);
    expect(result.trailing).toBeUndefined();
  });

  it('should parse command with prefix', () => {
    const result = tokenize(':nick!user@host PRIVMSG #channel :Hello');
    expect(result.prefix).toBe('nick!user@host');
    expect(result.command).toBe('PRIVMSG');
    expect(result.parameters).toEqual(['#channel']);
    expect(result.trailing).toBe('Hello');
  });

  it('should parse command with multiple parameters', () => {
    const result = tokenize('MODE #channel +o user');
    expect(result.command).toBe('MODE');
    expect(result.parameters).toEqual(['#channel', '+o', 'user']);
  });

  it('should parse command with tags', () => {
    const result = tokenize('@id=123;time=2024-01-01T00:00:00Z :nick!user@host PRIVMSG #channel :Hello');
    expect(result.tags?.get('id')).toBe('123');
    expect(result.tags?.get('time')).toBe('2024-01-01T00:00:00Z');
    expect(result.prefix).toBe('nick!user@host');
    expect(result.command).toBe('PRIVMSG');
  });
});
