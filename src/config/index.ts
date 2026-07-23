import type { ServerConfig } from '../models/Server.js';

export function loadConfig(): ServerConfig {
  return {
    port: parseInt(process.env['IRC_PORT'] ?? '6667', 10),
    hostname: process.env['IRC_HOST'] ?? '0.0.0.0',
    serverName: process.env['IRC_SERVER_NAME'] ?? 'my-irc.server',
    serverDescription: process.env['IRC_SERVER_DESC'] ?? 'A modern IRC server',
    motd: [
      'Welcome to my-irc server',
      'A production-quality IRC server built from scratch',
      'Enjoy your stay!',
    ],
    maxConnections: parseInt(process.env['IRC_MAX_CONNECTIONS'] ?? '1000', 10),
    maxChannelsPerUser: parseInt(process.env['IRC_MAX_CHANNELS'] ?? '20', 10),
    maxNickLength: parseInt(process.env['IRC_MAX_NICK'] ?? '30', 10),
    maxChannelNameLength: parseInt(process.env['IRC_MAX_CHAN_NAME'] ?? '50', 10),
    pingTimeout: parseInt(process.env['IRC_PING_TIMEOUT'] ?? '120000', 10),
    pingInterval: parseInt(process.env['IRC_PING_INTERVAL'] ?? '60000', 10),
    registrationTimeout: parseInt(process.env['IRC_REG_TIMEOUT'] ?? '60000', 10),
    version: '1.0.0',
    created: new Date(),
  };
}
