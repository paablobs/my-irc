# Architecture

## Overview

This IRC server follows Clean Architecture principles with clear separation of concerns.

## Layers

### Network Layer (`src/network/`)
- **TCPServer**: Handles raw TCP connections, socket management
- **ConnectionManager**: Manages connection lifecycle and state

### Protocol Layer (`src/protocol/`)
- **Tokenizer**: Splits raw IRC text into tokens
- **Parser**: Converts tokens into typed IRCMessage objects
- **Serializer**: Converts IRCMessage objects back to IRC protocol strings
- **NumericReplies**: Constants for IRC numeric replies

### Command Layer (`src/commands/`)
Each command implements the `Command` interface:
```typescript
interface Command {
  name: string;
  minParams: number;
  requiresRegistration: boolean;
  execute(context: CommandContext, message: IRCMessage): Promise<void>;
}
```

### Service Layer (`src/services/`)
- **UserService**: User registration, nicknames, state management
- **ChannelService**: Channel operations, membership, modes
- **MessageService**: Private and channel messaging
- **OperatorService**: IRC operator privileges

### Repository Layer (`src/repositories/`)
Abstracts persistence with interface/implementation pattern:
- **Interfaces**: Define data access contracts
- **Memory**: In-memory implementations (default)
- **Future**: SQLite, PostgreSQL implementations

### State Layer (`src/state/`)
- **ServerState**: Centralized server state container

## Data Flow

```
Network → Parser → IRCMessage → Router → Command → Service → Repository
                                                              ↓
Network ← Serializer ← IRCMessage ← Command ← Service ← Repository
```

## Design Principles

1. **Single Responsibility**: Each class has one reason to change
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Interface Segregation**: Clients depend only on interfaces they use
4. **Composition over Inheritance**: Prefer composing objects over class hierarchies
