import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';
import { serializeSimple } from '../../protocol/serializer.js';
import { RPL, ERR } from '../../protocol/numericReplies.js';
import { ConnectionState } from '../../models/User.js';

export class JoinCommand implements Command {
  readonly name = 'JOIN';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    const user = await context.state.users.findById(context.connection.userId!);
    if (!user || user.state !== ConnectionState.REGISTERED) {
      return;
    }

    const channelsParam = message.getParam(0);
    if (!channelsParam) {
      context.send(
        serializeSimple(ERR.NEEDMOREPARAMS, ['JOIN'], 'Not enough parameters', context.state.server.config.serverName),
      );
      return;
    }

    if (channelsParam === '0') {
      await this.partAllChannels(context, user);
      return;
    }

    const channelNames = channelsParam.split(',');
    const keys = message.getParam(1)?.split(',') ?? [];

    for (let i = 0; i < channelNames.length; i++) {
      const channelName = channelNames[i]!;
      const key = keys[i];

      await this.joinChannel(context, user, channelName, key);
    }
  }

  private async joinChannel(
    context: CommandContext,
    user: { id: string; nickname: string; channels: Set<string>; connectionId: string; hostmask: string },
    channelName: string,
    key?: string,
  ): Promise<void> {
    if (!channelName.startsWith('#') && !channelName.startsWith('&')) {
      context.send(
        serializeSimple(ERR.BADCHANMASK, [channelName], 'Invalid channel name', context.state.server.config.serverName),
      );
      return;
    }

    if (channelName.length > context.state.server.config.maxChannelNameLength) {
      context.send(
        serializeSimple(ERR.BADCHANMASK, [channelName], 'Channel name too long', context.state.server.config.serverName),
      );
      return;
    }

    if (user.channels.size >= context.state.server.config.maxChannelsPerUser) {
      context.send(
        serializeSimple(ERR.TOOMANYCHANNELS, [channelName], 'You have joined too many channels', context.state.server.config.serverName),
      );
      return;
    }

    let channel = await context.state.channels.findByName(channelName);
    let isNew = false;

    if (!channel) {
      channel = await context.state.channels.createChannel(channelName);
      isNew = true;
    }

    const activeChannel = channel;

    if (activeChannel.modes.has('k') && activeChannel.modes.get('k') !== key) {
      context.send(
        serializeSimple(ERR.BADCHANNELKEY, [channelName], 'Cannot join channel (+k)', context.state.server.config.serverName),
      );
      return;
    }

    if (activeChannel.modes.has('i') && !activeChannel.isInvited(user.nickname)) {
      context.send(
        serializeSimple(ERR.BANNEDFROMCHAN, [channelName], 'Cannot join channel (+i)', context.state.server.config.serverName),
      );
      return;
    }

    if (activeChannel.modes.has('l')) {
      const limit = parseInt(activeChannel.modes.get('l') ?? '0', 10);
      if (limit > 0 && activeChannel.userCount >= limit) {
        context.send(
          serializeSimple(ERR.BANNEDFROMCHAN, [channelName], 'Cannot join channel (+l)', context.state.server.config.serverName),
        );
        return;
      }
    }

    if (activeChannel.hasUser(user.nickname)) {
      return;
    }

    activeChannel.addUser(user.nickname);
    user.channels.add(channelName.toLowerCase());

    if (isNew) {
      activeChannel.addUserMode(user.nickname, 'o');
    }

    const joinMessage = serializeSimple('JOIN', [channelName], undefined, user.hostmask);

    for (const member of activeChannel.userNicknames) {
      const memberUser = await context.state.users.findByNickname(member);
      if (memberUser) {
        const conn = await context.state.connections.findById(memberUser.connectionId);
        if (conn) {
          conn.send(joinMessage);
        }
      }
    }

    if (activeChannel.topic) {
      context.send(
        serializeSimple(RPL.TOPIC, [user.nickname, channelName], activeChannel.topic, context.state.server.config.serverName),
      );
    }

    await this.sendNames(context, user.nickname, activeChannel);
  }

  private async sendNames(
    context: CommandContext,
    nickname: string,
    channel: { name: string; userNicknames: string[] },
  ): Promise<void> {
    const serverName = context.state.server.config.serverName;
    const names: string[] = [];

    for (const member of channel.userNicknames) {
      const memberUser = await context.state.users.findByNickname(member);
      if (memberUser) {
        const channelObj = await context.state.channels.findByName(channel.name);
        if (channelObj) {
          const modes = channelObj.getUserModes(member);
          let prefix = '';
          if (modes.has('o')) prefix = '@';
          else if (modes.has('v')) prefix = '+';
          names.push(`${prefix}${member}`);
        }
      }
    }

    const namesStr = names.join(' ');
    context.send(
      serializeSimple(RPL.NAMREPLY, [nickname, '=', channel.name], namesStr, serverName),
    );
    context.send(
      serializeSimple(RPL.ENDOFNAMES, [nickname, channel.name], 'End of /NAMES list.', serverName),
    );
  }

  private async partAllChannels(
    context: CommandContext,
    user: { id: string; nickname: string; channels: Set<string>; hostmask: string },
  ): Promise<void> {
    const channelNames = Array.from(user.channels);
    for (const channelName of channelNames) {
      const channel = await context.state.channels.findByName(channelName);
      if (channel) {
        channel.removeUser(user.nickname);
        user.channels.delete(channelName);

        const partMessage = serializeSimple('PART', [channelName], undefined, user.hostmask);
        for (const member of channel.userNicknames) {
          const memberUser = await context.state.users.findByNickname(member);
          if (memberUser) {
            const conn = await context.state.connections.findById(memberUser.connectionId);
            if (conn) {
              conn.send(partMessage);
            }
          }
        }

        if (channel.userCount === 0) {
          await context.state.channels.delete(channelName);
          context.state.server.decrementChannelCount();
        }
      }
    }
  }
}
