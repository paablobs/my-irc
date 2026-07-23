import { parseIRCMessage } from './ircParser';
import type { ParsedIRCMessage } from './ircParser';
import { useConnectionStore } from '../stores/connectionStore';
import { useChannelStore } from '../stores/channelStore';
import { useMessageStore } from '../stores/messageStore';
import { useUserStore } from '../stores/userStore';

export function handleIRCMessage(raw: string): void {
  const msg = parseIRCMessage(raw);
  const command = msg.command;

  switch (command) {
    case 'PING':
      handlePing(msg);
      break;
    case 'JOIN':
      handleJoin(msg);
      break;
    case 'PART':
      handlePart(msg);
      break;
    case 'QUIT':
      handleQuit(msg);
      break;
    case 'PRIVMSG':
      handlePrivmsg(msg);
      break;
    case 'NOTICE':
      handleNotice(msg);
      break;
    case 'NICK':
      handleNick(msg);
      break;
    case 'TOPIC':
      handleTopic(msg);
      break;
    case 'MODE':
      handleMode(msg);
      break;
    case 'KICK':
      handleKick(msg);
      break;
    case 'INVITE':
      handleInvite(msg);
      break;
    case '332':
      handleRPLTopic(msg);
      break;
    case '353':
      handleRPLNamReply(msg);
      break;
    case '366':
      break;
    case '001':
      handleWelcome(msg);
      break;
    case '002':
    case '003':
    case '004':
    case '005':
      handleServerInfo(msg);
      break;
    case '375':
    case '372':
    case '376':
      handleMotd(msg);
      break;
    case '311':
    case '312':
    case '313':
    case '317':
    case '318':
    case '319':
      handleWhois(msg);
      break;
    case '352':
      handleWhoReply(msg);
      break;
    case '315':
      break;
    case '322':
      handleListEntry(msg);
      break;
    case '321':
    case '323':
      break;
    case '391':
      handleTime(msg);
      break;
    case '351':
      handleVersion(msg);
      break;
    case '433':
      handleNicknameInUse(msg);
      break;
    default:
      if (/^\d{3}$/.test(command)) {
        handleNumeric(msg);
      } else {
        console.log('Unhandled IRC message:', raw);
      }
  }
}

function handlePing(msg: ParsedIRCMessage): void {
  const token = msg.params[0] || msg.trailing || '';
  const connectionStore = useConnectionStore.getState();
  if (connectionStore.isConnected) {
    window.__ircClient?.sendCommand(`PONG :${token}`);
  }
}

function handleJoin(msg: ParsedIRCMessage): void {
  const channel = msg.params[0] || msg.trailing;
  if (!channel || !msg.nick) return;

  const channelStore = useChannelStore.getState();
  const userStore = useUserStore.getState();
  const messageStore = useMessageStore.getState();
  const currentUser = useConnectionStore.getState().nickname;

  if (msg.nick.toLowerCase() === currentUser.toLowerCase()) {
    channelStore.addChannel({
      name: channel,
      topic: '',
      joined: true,
      unreadCount: 0,
      lastActivity: new Date(),
      modes: [],
    });
    channelStore.setActiveChannel(channel);
  }

  const existingUser = userStore.getUser(msg.nick);
  if (existingUser) {
    userStore.updateUser(msg.nick, {
      channels: [...existingUser.channels, channel.toLowerCase()],
    });
  } else {
    userStore.addUser({
      nickname: msg.nick,
      username: msg.user,
      hostname: msg.host,
      modes: [],
      away: false,
      channels: [channel.toLowerCase()],
      lastActive: new Date(),
      isOperator: false,
      isVoiced: false,
    });
  }

  messageStore.addMessage(channel, {
    id: '',
    channel,
    sender: msg.nick,
    content: `${msg.nick} has joined ${channel}`,
    timestamp: new Date(),
    type: 'join',
  });
}

function handlePart(msg: ParsedIRCMessage): void {
  const channel = msg.params[0];
  if (!channel || !msg.nick) return;

  const channelStore = useChannelStore.getState();
  const userStore = useUserStore.getState();
  const messageStore = useMessageStore.getState();
  const currentUser = useConnectionStore.getState().nickname;

  if (msg.nick.toLowerCase() === currentUser.toLowerCase()) {
    channelStore.removeChannel(channel);
  } else {
    const user = userStore.getUser(msg.nick);
    if (user) {
      userStore.updateUser(msg.nick, {
        channels: user.channels.filter((c) => c !== channel.toLowerCase()),
      });
    }
  }

  messageStore.addMessage(channel, {
    id: '',
    channel,
    sender: msg.nick,
    content: `${msg.nick} has left ${channel}${msg.trailing ? ` (${msg.trailing})` : ''}`,
    timestamp: new Date(),
    type: 'part',
  });
}

function handleQuit(msg: ParsedIRCMessage): void {
  if (!msg.nick) return;

  const userStore = useUserStore.getState();
  const messageStore = useMessageStore.getState();
  const reason = msg.trailing || 'Quit';

  const user = userStore.getUser(msg.nick);
  if (user) {
    for (const channel of user.channels) {
      messageStore.addMessage(channel, {
        id: '',
        channel,
        sender: msg.nick,
        content: `${msg.nick} has quit (${reason})`,
        timestamp: new Date(),
        type: 'quit',
      });
    }
    userStore.removeUser(msg.nick);
  }
}

function handlePrivmsg(msg: ParsedIRCMessage): void {
  const target = msg.params[0];
  const content = msg.trailing;
  if (!target || !content || !msg.nick) return;

  const messageStore = useMessageStore.getState();
  const channelStore = useChannelStore.getState();
  const currentUser = useConnectionStore.getState().nickname;

  const channel = target.toLowerCase() === currentUser.toLowerCase() ? msg.nick : target;

  messageStore.addMessage(channel, {
    id: '',
    channel,
    sender: msg.nick,
    senderHostmask: msg.prefix,
    content,
    timestamp: new Date(),
    type: 'message',
  });

  if (channelStore.activeChannel?.toLowerCase() !== channel.toLowerCase()) {
    channelStore.incrementUnread(channel);
  }
}

function handleNotice(msg: ParsedIRCMessage): void {
  const content = msg.trailing;
  if (!content) return;

  const messageStore = useMessageStore.getState();
  const activeChannel = useChannelStore.getState().activeChannel;

  messageStore.addMessage(activeChannel || 'server', {
    id: '',
    channel: activeChannel || 'server',
    sender: msg.nick || 'Server',
    content,
    timestamp: new Date(),
    type: 'notice',
  });
}

function handleNick(msg: ParsedIRCMessage): void {
  const newNick = msg.trailing || msg.params[0];
  if (!newNick || !msg.nick) return;

  const userStore = useUserStore.getState();
  const connectionStore = useConnectionStore.getState();
  const messageStore = useMessageStore.getState();

  if (msg.nick.toLowerCase() === connectionStore.nickname.toLowerCase()) {
    connectionStore.setConnectionInfo({
      ...connectionStore,
      nickname: newNick,
    });
  }

  userStore.changeNickname(msg.nick, newNick);

  const user = userStore.getUser(newNick);
  if (user) {
    for (const channel of user.channels) {
      messageStore.addMessage(channel, {
        id: '',
        channel,
        sender: msg.nick,
        content: `${msg.nick} is now known as ${newNick}`,
        timestamp: new Date(),
        type: 'nick',
      });
    }
  }
}

function handleTopic(msg: ParsedIRCMessage): void {
  const channel = msg.params[0];
  const topic = msg.trailing;
  if (!channel || !topic) return;

  const channelStore = useChannelStore.getState();
  const messageStore = useMessageStore.getState();

  channelStore.updateChannel(channel, { topic, topicSetBy: msg.nick });

  messageStore.addMessage(channel, {
    id: '',
    channel,
    sender: msg.nick || '*',
    content: `${msg.nick} changed the topic to: ${topic}`,
    timestamp: new Date(),
    type: 'topic',
  });
}

function handleMode(msg: ParsedIRCMessage): void {
  const target = msg.params[0];
  if (!target) return;

  const messageStore = useMessageStore.getState();
  const modes = msg.params.slice(1).join(' ');

  messageStore.addMessage(target.startsWith('#') ? target : 'server', {
    id: '',
    channel: target.startsWith('#') ? target : 'server',
    sender: msg.nick || '*',
    content: `Mode ${target} ${modes}`,
    timestamp: new Date(),
    type: 'mode',
  });
}

function handleKick(msg: ParsedIRCMessage): void {
  const channel = msg.params[0];
  const target = msg.params[1];
  if (!channel || !target) return;

  const userStore = useUserStore.getState();
  const messageStore = useMessageStore.getState();
  const currentUser = useConnectionStore.getState().nickname;

  if (target.toLowerCase() === currentUser.toLowerCase()) {
    useChannelStore.getState().removeChannel(channel);
  } else {
    const user = userStore.getUser(target);
    if (user) {
      userStore.updateUser(target, {
        channels: user.channels.filter((c) => c !== channel.toLowerCase()),
      });
    }
  }

  messageStore.addMessage(channel, {
    id: '',
    channel,
    sender: msg.nick || '*',
    content: `${target} was kicked from ${channel} by ${msg.nick}${msg.trailing ? ` (${msg.trailing})` : ''}`,
    timestamp: new Date(),
    type: 'kick',
  });
}

function handleInvite(msg: ParsedIRCMessage): void {
  const channel = msg.params[1] || msg.trailing;
  if (!channel) return;

  const messageStore = useMessageStore.getState();
  messageStore.addSystemMessage('server', `${msg.nick} invited you to ${channel}`);
}

function handleRPLTopic(msg: ParsedIRCMessage): void {
  const channel = msg.params[1];
  const topic = msg.trailing;
  if (!channel) return;

  useChannelStore.getState().updateChannel(channel, { topic: topic || '' });
}

function handleRPLNamReply(msg: ParsedIRCMessage): void {
  const channel = msg.params[2];
  if (!channel) return;

  const names = (msg.trailing || '').split(/\s+/).filter(Boolean);
  const userStore = useUserStore.getState();

  for (const name of names) {
    let nickname = name;
    let isOp = false;
    let isVoiced = false;

    if (nickname.startsWith('@')) {
      isOp = true;
      nickname = nickname.slice(1);
    } else if (nickname.startsWith('+')) {
      isVoiced = true;
      nickname = nickname.slice(1);
    }

    const existing = userStore.getUser(nickname);
    if (existing) {
      userStore.updateUser(nickname, {
        channels: [...new Set([...existing.channels, channel.toLowerCase()])],
        isOperator: isOp || existing.isOperator,
        isVoiced: isVoiced || existing.isVoiced,
      });
    } else {
      userStore.addUser({
        nickname,
        modes: [],
        away: false,
        channels: [channel.toLowerCase()],
        lastActive: new Date(),
        isOperator: isOp,
        isVoiced,
      });
    }
  }
}

function handleWelcome(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
  useConnectionStore.getState().setConnected(true);
}

function handleServerInfo(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleMotd(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleWhois(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.slice(1).join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleWhoReply(msg: ParsedIRCMessage): void {
  const content = msg.params.slice(1).join(' ') + (msg.trailing ? ` ${msg.trailing}` : '');
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleListEntry(msg: ParsedIRCMessage): void {
  const channel = msg.params[1];
  const users = msg.params[2];
  const topic = msg.trailing || '';
  useMessageStore.getState().addSystemMessage('server', `${channel} (${users} users): ${topic}`);
}

function handleTime(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleVersion(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleNicknameInUse(msg: ParsedIRCMessage): void {
  const nick = msg.params[1] || msg.params[0];
  const content = msg.trailing || `${nick}: Nickname is already in use`;
  useMessageStore.getState().addSystemMessage('server', content);
}

function handleNumeric(msg: ParsedIRCMessage): void {
  const content = msg.trailing || msg.params.slice(1).join(' ');
  useMessageStore.getState().addSystemMessage('server', content);
}

declare global {
  interface Window {
    __ircClient?: {
      sendCommand: (command: string) => void;
    };
  }
}
