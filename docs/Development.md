# Development Guide

## Prerequisites

- Node.js >= 20.0.0
- npm

## Setup

```bash
npm install
```

## Development

### Run in development mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run production build
```bash
npm start
```

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Code Quality

### Type checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Project Structure

```
src/
├── main.ts              # Entry point
├── config/              # Configuration
├── network/             # TCP server, connection management
├── protocol/            # Parser, serializer, numeric replies
├── router/              # Command routing
├── commands/            # Command implementations
├── services/            # Business logic
├── models/              # Domain models
├── repositories/        # Data access layer
├── state/               # Server state
└── utils/               # Utilities (logger)
```

## Adding a New Command

1. Create a new directory under `src/commands/`
2. Implement the `Command` interface
3. Export the command in `src/commands/index.ts`
4. Register the command in `src/main.ts`

Example:
```typescript
import type { Command, CommandContext } from '../base/Command.js';
import type { IRCMessage } from '../../models/IRCMessage.js';

export class MyCommand implements Command {
  readonly name = 'MYCMD';
  readonly minParams = 1;
  readonly requiresRegistration = true;

  async execute(context: CommandContext, message: IRCMessage): Promise<void> {
    // Implementation
  }
}
```

## Configuration

Environment variables:
- `IRC_PORT` - Server port (default: 6667)
- `IRC_HOST` - Bind address (default: 0.0.0.0)
- `IRC_SERVER_NAME` - Server name
- `IRC_MAX_CONNECTIONS` - Max connections
- `IRC_MAX_CHANNELS` - Max channels per user
- `IRC_MAX_NICK` - Max nickname length
- `IRC_PING_TIMEOUT` - Ping timeout (ms)
- `IRC_PING_INTERVAL` - Ping interval (ms)
