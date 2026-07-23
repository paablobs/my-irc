import { describe, it, expect } from 'vitest';
import { parse } from '../src/protocol/parser.js';

describe('Parser', () => {
  it('should parse a simple message', () => {
    const msg = parse('PING :server');
    expect(msg.command).toBe('PING');
    expect(msg.trailing).toBe('server');
    expect(msg.parameters).toEqual([]);
  });

  it('should parse message with prefix', () => {
    const msg = parse(':nick!user@host PRIVMSG #channel :Hello World');
    expect(msg.prefix).toBe('nick!user@host');
    expect(msg.command).toBe('PRIVMSG');
    expect(msg.parameters).toEqual(['#channel']);
    expect(msg.trailing).toBe('Hello World');
  });

  it('should parse message with multiple parameters', () => {
    const msg = parse('MODE #channel +o user');
    expect(msg.command).toBe('MODE');
    expect(msg.parameters).toEqual(['#channel', '+o', 'user']);
    expect(msg.trailing).toBeUndefined();
  });

  it('should get all params including trailing', () => {
    const msg = parse('PRIVMSG #channel :Hello');
    expect(msg.allParams).toEqual(['#channel', 'Hello']);
  });

  it('should get param by index', () => {
    const msg = parse('PRIVMSG #channel :Hello');
    expect(msg.getParam(0)).toBe('#channel');
    expect(msg.getParam(1)).toBe('Hello');
    expect(msg.getParam(2)).toBeUndefined();
  });

  it('should throw on empty message', () => {
    expect(() => parse('')).toThrow('Empty message');
  });

  it('should convert to string', () => {
    const msg = parse(':nick!user@host PRIVMSG #channel :Hello');
    expect(msg.toString()).toBe(':nick!user@host PRIVMSG #channel :Hello');
  });
});
