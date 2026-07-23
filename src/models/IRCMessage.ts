export interface IRCMessageParams {
  readonly prefix?: string;
  readonly command: string;
  readonly parameters: readonly string[];
  readonly trailing?: string;
  readonly tags?: Map<string, string>;
}

export class IRCMessage implements IRCMessageParams {
  readonly prefix?: string;
  readonly command: string;
  readonly parameters: readonly string[];
  readonly trailing?: string;
  readonly tags?: Map<string, string>;
  readonly raw: string;

  constructor(params: IRCMessageParams) {
    this.prefix = params.prefix;
    this.command = params.command.toUpperCase();
    this.parameters = params.parameters;
    this.trailing = params.trailing;
    this.tags = params.tags;
    this.raw = this.buildRaw();
  }

  get allParams(): string[] {
    const result = [...this.parameters];
    if (this.trailing !== undefined) {
      result.push(this.trailing);
    }
    return result;
  }

  get paramCount(): number {
    return this.parameters.length + (this.trailing !== undefined ? 1 : 0);
  }

  getParam(index: number): string | undefined {
    if (index < this.parameters.length) {
      return this.parameters[index];
    }
    if (index === this.parameters.length && this.trailing !== undefined) {
      return this.trailing;
    }
    return undefined;
  }

  private buildRaw(): string {
    let raw = '';

    if (this.tags && this.tags.size > 0) {
      const tagParts: string[] = [];
      for (const [key, value] of this.tags) {
        tagParts.push(`${key}=${value}`);
      }
      raw += `@${tagParts.join(';')} `;
    }

    if (this.prefix) {
      raw += `:${this.prefix} `;
    }

    raw += this.command;

    for (const param of this.parameters) {
      raw += ` ${param}`;
    }

    if (this.trailing !== undefined) {
      raw += ` :${this.trailing}`;
    }

    return raw;
  }

  toString(): string {
    return this.raw;
  }
}
