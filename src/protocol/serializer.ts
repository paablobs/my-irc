import type { IRCMessage } from '../models/IRCMessage.js';

export function serialize(message: IRCMessage): string {
  let result = '';

  if (message.tags && message.tags.size > 0) {
    const tagParts: string[] = [];
    for (const [key, value] of message.tags) {
      tagParts.push(`${key}=${escapeTagValue(value)}`);
    }
    result += `@${tagParts.join(';')} `;
  }

  if (message.prefix) {
    result += `:${message.prefix} `;
  }

  result += message.command;

  for (const param of message.parameters) {
    result += ` ${param}`;
  }

  if (message.trailing !== undefined) {
    result += ` :${message.trailing}`;
  }

  return `${result}\r\n`;
}

export function serializeSimple(
  command: string,
  params: string[] = [],
  trailing?: string,
  prefix?: string,
): string {
  let result = '';

  if (prefix) {
    result += `:${prefix} `;
  }

  result += command;

  for (const param of params) {
    result += ` ${param}`;
  }

  if (trailing !== undefined) {
    result += ` :${trailing}`;
  }

  return `${result}\r\n`;
}

export function serializeNumeric(
  serverName: string,
  target: string,
  numeric: string,
  params: string[],
  trailing?: string,
): string {
  return serializeSimple(numeric, [target, ...params], trailing, serverName);
}

function escapeTagValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\:')
    .replace(/ /g, '\\s')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}
