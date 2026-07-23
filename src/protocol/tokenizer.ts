export interface TokenizedMessage {
  tags?: Map<string, string>;
  prefix?: string;
  command: string;
  parameters: string[];
  trailing?: string;
}

export function tokenize(raw: string): TokenizedMessage {
  let remaining = raw.trim();
  const result: Partial<TokenizedMessage> = {};

  if (remaining.startsWith('@')) {
    const tagEnd = remaining.indexOf(' ');
    if (tagEnd === -1) {
      throw new Error('Invalid message: tags without command');
    }
    const tagStr = remaining.slice(1, tagEnd);
    result.tags = parseTags(tagStr);
    remaining = remaining.slice(tagEnd + 1).trimStart();
  }

  if (remaining.startsWith(':')) {
    const prefixEnd = remaining.indexOf(' ');
    if (prefixEnd === -1) {
      throw new Error('Invalid message: prefix without command');
    }
    result.prefix = remaining.slice(1, prefixEnd);
    remaining = remaining.slice(prefixEnd + 1).trimStart();
  }

  const trailingIndex = remaining.indexOf(' :');
  let commandAndParams: string;
  if (trailingIndex !== -1) {
    result.trailing = remaining.slice(trailingIndex + 2);
    commandAndParams = remaining.slice(0, trailingIndex);
  } else {
    commandAndParams = remaining;
  }

  const parts = commandAndParams.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length === 0) {
    throw new Error('Invalid message: no command');
  }

  result.command = parts[0]!;
  result.parameters = parts.slice(1);

  return result as TokenizedMessage;
}

function parseTags(tagStr: string): Map<string, string> {
  const tags = new Map<string, string>();
  const pairs = tagStr.split(';');
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) {
      tags.set(pair, '');
    } else {
      const key = pair.slice(0, eqIndex);
      const value = pair.slice(eqIndex + 1).replace(/\\:/g, ';')
        .replace(/\\s/g, ' ')
        .replace(/\\\\/g, '\\')
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n');
      tags.set(key, value);
    }
  }
  return tags;
}
