# my-irc

> **Educational project** — This project was created for learning purposes only. It is not intended to replace existing IRC servers and clients such as InspIRCd, UnrealIRCd, HexChat, irssi, mIRC, or other programs that have been in production for years and are used by millions of users.

An IRC server built from scratch in TypeScript, designed to understand how the IRC protocol and real-time chat server architectures work.

## Purpose

This project exists as an educational reference to:

- Learn the IRC protocol (RFC 1459, RFC 2812)
- Understand TCP server architectures
- Practice Clean Architecture and SOLID principles
- Explore WebSockets as a bridge between protocols
- Build a modern web application with React

## Features

### IRC Server
- Full IRC protocol implementation
- Clean Architecture with separation of concerns
- Strict TypeScript
- Modular command system
- In-memory and database persistence support
- Structured logging
- Comprehensive test suite

### Web Client
- Modern UI inspired by Discord/Slack
- React 19 + Chakra UI
- WebSocket gateway for server communication
- Dark/light theme
- State management with Zustand

## Quick Start

### IRC Server
```bash
npm install
npm run dev
```

### Web Client
```bash
./start.sh
```

This starts:
- IRC Server on port 6667
- WebSocket Gateway on port 8080
- Web Client at http://localhost:5173

### Manual connection
```bash
telnet localhost 6667
```

## Supported Commands

- **Connection**: NICK, USER, PING, PONG, QUIT
- **Channels**: JOIN, PART, LIST, NAMES, TOPIC, MODE, INVITE, KICK
- **Messaging**: PRIVMSG, NOTICE
- **Information**: WHO, WHOIS, MOTD, VERSION, TIME

## Architecture

```
Frontend (React) → WebSocket Gateway → IRC Server
```

The web client does not replace the IRC protocol — it acts as a visual bridge to interact with standard IRC servers.

## Documentation

- [Architecture](docs/Architecture.md)
- [Protocol](docs/Protocol.md)
- [Development](docs/Development.md)
- [Contributing](docs/Contributing.md)

## Production Alternatives

If you need an IRC server for real-world use, consider:

- **Servers**: [InspIRCd](https://www.inspircd.org/), [UnrealIRCd](https://www.unrealircd.org/), [Ergo](https://ergo.chat/)
- **Clients**: [HexChat](https://hexchat.net/), [irssi](https://irssi.org/), [WeeChat](https://weechat.org/), [mIRC](https://www.mirc.com/)

These projects have years of development, thousands of active users, and are used in production daily.

## License

MIT
