import { IRCMessage } from '../models/IRCMessage.js';
import { tokenize } from './tokenizer.js';

export function parse(raw: string): IRCMessage {
  if (!raw || raw.trim().length === 0) {
    throw new Error('Empty message');
  }

  const tokenized = tokenize(raw);
  return new IRCMessage({
    prefix: tokenized.prefix,
    command: tokenized.command,
    parameters: tokenized.parameters,
    trailing: tokenized.trailing,
    tags: tokenized.tags,
  });
}

export function parseMultiple(raw: string): IRCMessage[] {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => parse(line));
}
