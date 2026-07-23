export interface ParsedIRCMessage {
  prefix?: string;
  nick?: string;
  user?: string;
  host?: string;
  command: string;
  params: string[];
  trailing?: string;
  raw: string;
}

export function parseIRCMessage(raw: string): ParsedIRCMessage {
  let remaining = raw.trim();
  const result: Partial<ParsedIRCMessage> = { raw };

  if (remaining.startsWith('@')) {
    const spaceIndex = remaining.indexOf(' ');
    if (spaceIndex !== -1) {
      remaining = remaining.slice(spaceIndex + 1);
    }
  }

  if (remaining.startsWith(':')) {
    const spaceIndex = remaining.indexOf(' ');
    if (spaceIndex !== -1) {
      result.prefix = remaining.slice(1, spaceIndex);
      remaining = remaining.slice(spaceIndex + 1);

      const match = result.prefix.match(/^([^!]+)!([^@]+)@(.+)$/);
      if (match) {
        result.nick = match[1];
        result.user = match[2];
        result.host = match[3];
      }
    }
  }

  const trailingIndex = remaining.indexOf(' :');
  if (trailingIndex !== -1) {
    result.trailing = remaining.slice(trailingIndex + 2);
    remaining = remaining.slice(0, trailingIndex);
  }

  const parts = remaining.split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    result.command = parts[0]!.toUpperCase();
    result.params = parts.slice(1);
  } else {
    result.command = '';
    result.params = [];
  }

  return result as ParsedIRCMessage;
}

export function getNumericName(numeric: string): string {
  const names: Record<string, string> = {
    '001': 'RPL_WELCOME',
    '002': 'RPL_YOURHOST',
    '003': 'RPL_CREATED',
    '004': 'RPL_MYINFO',
    '005': 'RPL_ISUPPORT',
    '301': 'RPL_AWAY',
    '305': 'RPL_UNAWAY',
    '306': 'RPL_NOWAWAY',
    '311': 'RPL_WHOISUSER',
    '312': 'RPL_WHOISSERVER',
    '313': 'RPL_WHOISOPERATOR',
    '317': 'RPL_WHOISIDLE',
    '318': 'RPL_ENDOFWHOIS',
    '319': 'RPL_WHOISCHANNELS',
    '321': 'RPL_LISTSTART',
    '322': 'RPL_LIST',
    '323': 'RPL_LISTEND',
    '324': 'RPL_CHANNELMODEIS',
    '331': 'RPL_NOTOPIC',
    '332': 'RPL_TOPIC',
    '333': 'RPL_TOPICWHOTIME',
    '341': 'RPL_INVITING',
    '352': 'RPL_WHOREPLY',
    '315': 'RPL_ENDOFWHO',
    '353': 'RPL_NAMREPLY',
    '366': 'RPL_ENDOFNAMES',
    '367': 'RPL_BANLIST',
    '368': 'RPL_ENDOFBANLIST',
    '372': 'RPL_MOTD',
    '375': 'RPL_MOTDSTART',
    '376': 'RPL_ENDOFMOTD',
    '381': 'RPL_YOUREOPER',
    '391': 'RPL_TIME',
    '351': 'RPL_VERSION',
    '401': 'ERR_NOSUCHNICK',
    '403': 'ERR_NOSUCHCHANNEL',
    '404': 'ERR_CANNOTSENDTOCHAN',
    '405': 'ERR_TOOMANYCHANNELS',
    '421': 'ERR_UNKNOWNCOMMAND',
    '422': 'ERR_NOMOTD',
    '431': 'ERR_NONICKNAMEGIVEN',
    '432': 'ERR_ERRONEUSNICKNAME',
    '433': 'ERR_NICKNAMEINUSE',
    '441': 'ERR_USERNOTINCHANNEL',
    '442': 'ERR_NOTONCHANNEL',
    '443': 'ERR_USERONCHANNEL',
    '461': 'ERR_NEEDMOREPARAMS',
    '462': 'ERR_ALREADYREGISTRED',
    '464': 'ERR_PASSWDMISMATCH',
    '471': 'ERR_CHANNELISFULL',
    '473': 'ERR_INVITEONLYCHAN',
    '474': 'ERR_BANNEDFROMCHAN',
    '475': 'ERR_BADCHANNELKEY',
    '481': 'ERR_NOPRIVILEGES',
    '482': 'ERR_CHANOPRIVSNEEDED',
    '501': 'ERR_UMODEUNKNOWNFLAG',
    '502': 'ERR_USERSDONTMATCH',
  };
  return names[numeric] || numeric;
}
