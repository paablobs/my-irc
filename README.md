# my-irc

A production-quality IRC server built from scratch in TypeScript.

## Features

- Full IRC protocol implementation
- Clean Architecture with separation of concerns
- Type-safe with strict TypeScript
- Modular command system
- In-memory and database persistence support
- Structured logging
- Comprehensive test suite

## Quick Start

```bash
npm install
npm run dev
```

Connect to the server:
```bash
telnet localhost 6667
```

## Supported Commands

- Connection: NICK, USER, PING, PONG, QUIT
- Channels: JOIN, PART, LIST, NAMES, TOPIC, MODE, INVITE, KICK
- Messaging: PRIVMSG, NOTICE
- Information: WHO, WHOIS, MOTD, VERSION, TIME

## Documentation

- [Architecture](docs/Architecture.md)
- [Protocol](docs/Protocol.md)
- [Development](docs/Development.md)
- [Contributing](docs/Contributing.md)

## License

MIT
