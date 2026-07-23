import { WebSocketServer, WebSocket } from 'ws';
import { createConnection, type Socket } from 'node:net';
import { randomUUID } from 'node:crypto';

interface IRCConnection {
  id: string;
  socket: Socket;
  ws: WebSocket;
  nickname: string;
  username: string;
  realname: string;
  registered: boolean;
  buffer: string;
}

const IRC_HOST = process.env['IRC_HOST'] || 'localhost';
const IRC_PORT = parseInt(process.env['IRC_PORT'] || '6667', 10);
const WS_PORT = parseInt(process.env['WS_PORT'] || '8080', 10);

const connections = new Map<string, IRCConnection>();

const wss = new WebSocketServer({ port: WS_PORT });

console.log(`WebSocket gateway listening on port ${WS_PORT}`);
console.log(`Connecting to IRC server at ${IRC_HOST}:${IRC_PORT}`);

wss.on('connection', (ws: WebSocket) => {
  const id = randomUUID();
  console.log(`WebSocket client connected: ${id}`);

  const ircSocket = createConnection(IRC_PORT, IRC_HOST);

  const conn: IRCConnection = {
    id,
    socket: ircSocket,
    ws,
    nickname: '',
    username: '',
    realname: '',
    registered: false,
    buffer: '',
  };

  connections.set(id, conn);

  ircSocket.on('connect', () => {
    console.log(`IRC connected for client ${id}`);
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  ircSocket.on('data', (data: Buffer) => {
    conn.buffer += data.toString();
    const lines = conn.buffer.split(/\r?\n/);
    conn.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        ws.send(JSON.stringify({ type: 'irc', data: line }));
      }
    }
  });

  ircSocket.on('close', () => {
    console.log(`IRC disconnected for client ${id}`);
    ws.send(JSON.stringify({ type: 'disconnected' }));
    connections.delete(id);
  });

  ircSocket.on('error', (err: Error) => {
    console.error(`IRC error for client ${id}:`, err.message);
    ws.send(JSON.stringify({ type: 'error', message: err.message }));
  });

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'register':
          conn.nickname = msg.nickname;
          conn.username = msg.username;
          conn.realname = msg.realname;
          ircSocket.write(`NICK ${msg.nickname}\r\n`);
          ircSocket.write(`USER ${msg.username} 0 * :${msg.realname}\r\n`);
          break;

        case 'command':
          if (msg.data) {
            ircSocket.write(`${msg.data}\r\n`);
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (err) {
      console.error(`Error processing message from ${id}:`, err);
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${id}`);
    ircSocket.end();
    connections.delete(id);
  });

  ws.on('error', (err: Error) => {
    console.error(`WebSocket error for ${id}:`, err.message);
    ircSocket.end();
    connections.delete(id);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down gateway...');
  for (const conn of connections.values()) {
    conn.socket.end();
    conn.ws.close();
  }
  wss.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gateway...');
  for (const conn of connections.values()) {
    conn.socket.end();
    conn.ws.close();
  }
  wss.close();
  process.exit(0);
});
