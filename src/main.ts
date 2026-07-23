import { loadConfig } from './config/index.js';
import { createServerState } from './state/serverState.js';
import { TCPServer } from './network/tcpServer.js';
import { ConnectionManager } from './network/connectionManager.js';
import { CommandRouter } from './router/commandRouter.js';
import { parse } from './protocol/parser.js';
import { ConsoleLogger, LogLevel } from './utils/logger.js';
import { NickCommand } from './commands/nick/NickCommand.js';
import { UserCommand } from './commands/user/UserCommand.js';
import { PingCommand } from './commands/ping/PingCommand.js';
import { PongCommand } from './commands/pong/PongCommand.js';
import { QuitCommand } from './commands/quit/QuitCommand.js';
import { JoinCommand } from './commands/join/JoinCommand.js';
import { PartCommand } from './commands/part/PartCommand.js';
import { ListCommand } from './commands/list/ListCommand.js';
import { NamesCommand } from './commands/names/NamesCommand.js';
import { PrivmsgCommand } from './commands/privmsg/PrivmsgCommand.js';
import { NoticeCommand } from './commands/notice/NoticeCommand.js';
import { WhoCommand } from './commands/who/WhoCommand.js';
import { WhoisCommand } from './commands/whois/WhoisCommand.js';
import { MotdCommand } from './commands/motd/MotdCommand.js';
import { VersionCommand } from './commands/version/VersionCommand.js';
import { TimeCommand } from './commands/time/TimeCommand.js';
import { ModeCommand } from './commands/mode/ModeCommand.js';
import { TopicCommand } from './commands/topic/TopicCommand.js';
import { InviteCommand } from './commands/invite/InviteCommand.js';
import { KickCommand } from './commands/kick/KickCommand.js';
import type { Connection } from './models/Connection.js';
import type { CommandContext } from './commands/base/Command.js';
import type { ServerStateContainer } from './state/serverState.js';

const logger = new ConsoleLogger(LogLevel.INFO);

const lineBuffers = new Map<string, string>();

async function main(): Promise<void> {
  logger.info('Starting my-irc server...');

  const config = loadConfig();
  const state = createServerState(config);
  const connectionManager = new ConnectionManager(state);
  const router = new CommandRouter();

  router.register(new NickCommand());
  router.register(new UserCommand());
  router.register(new PingCommand());
  router.register(new PongCommand());
  router.register(new QuitCommand());
  router.register(new JoinCommand());
  router.register(new PartCommand());
  router.register(new ListCommand());
  router.register(new NamesCommand());
  router.register(new PrivmsgCommand());
  router.register(new NoticeCommand());
  router.register(new WhoCommand());
  router.register(new WhoisCommand());
  router.register(new MotdCommand());
  router.register(new VersionCommand());
  router.register(new TimeCommand());
  router.register(new ModeCommand());
  router.register(new TopicCommand());
  router.register(new InviteCommand());
  router.register(new KickCommand());

  const tcpServer = new TCPServer(config.hostname, config.port);

  tcpServer.on('connection', (connection: Connection) => {
    logger.info('New connection', {
      id: connection.id,
      remote: `${connection.remoteAddress}:${connection.remotePort}`,
    });
    connectionManager.addConnection(connection);
    lineBuffers.set(connection.id, '');
  });

  tcpServer.on('data', async (connection: Connection, data: Buffer) => {
    await handleData(connection, data, state, router);
  });

  tcpServer.on('disconnect', async (connection: Connection) => {
    logger.info('Connection disconnected', { id: connection.id });
    lineBuffers.delete(connection.id);
    await connectionManager.removeConnection(connection.id);
    if (connection.userId) {
      await state.users.delete(connection.userId);
      state.server.decrementUserCount();
    }
  });

  tcpServer.on('error', (error: Error) => {
    logger.error('TCP server error', { error: error.message });
  });

  tcpServer.on('listening', () => {
    logger.info(`Server listening on ${config.hostname}:${config.port}`);
  });

  await tcpServer.start();

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await tcpServer.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await tcpServer.stop();
    process.exit(0);
  });
}

async function handleData(
  connection: Connection,
  data: Buffer,
  state: ServerStateContainer,
  router: CommandRouter,
): Promise<void> {
  let buffer = lineBuffers.get(connection.id) ?? '';
  buffer += data.toString();

  const lines = buffer.split(/\r?\n/);
  const incomplete = lines.pop() ?? '';
  lineBuffers.set(connection.id, incomplete);

  for (const line of lines) {
    if (line.trim().length === 0) continue;

    try {
      const message = parse(line);
      const context: CommandContext = {
        state,
        connection,
        send: (data: string) => connection.send(data),
      };
      await router.route(context, message);
    } catch (error) {
      logger.error('Error processing message', {
        connectionId: connection.id,
        line,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

main().catch((error) => {
  logger.error('Fatal error', { error: error instanceof Error ? error.message : 'Unknown error' });
  process.exit(1);
});
