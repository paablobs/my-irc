# IRC Protocol Implementation

## Supported Commands

### Connection Registration
- `NICK` - Set or change nickname
- `USER` - Set username and realname
- `PING` / `PONG` - Connection keepalive
- `QUIT` - Disconnect from server

### Channel Operations
- `JOIN` - Join a channel
- `PART` - Leave a channel
- `LIST` - List available channels
- `NAMES` - List users in a channel
- `TOPIC` - View or set channel topic
- `MODE` - View or set channel/user modes
- `INVITE` - Invite user to channel
- `KICK` - Remove user from channel

### Messaging
- `PRIVMSG` - Send private message
- `NOTICE` - Send notice (no auto-reply)

### Information
- `WHO` - List users matching criteria
- `WHOIS` - Get detailed user information
- `MOTD` - Message of the Day
- `VERSION` - Server version
- `TIME` - Server time

## Message Format

```
[:<prefix>] <command> [<params...] [:<trailing>]
```

### Examples

```
PING :server
:nick!user@host PRIVMSG #channel :Hello World
MODE #channel +o user
```

## Numeric Replies

The server uses standard IRC numeric replies:
- `001-004`: Welcome messages
- `301-306`: Away status
- `311-319`: WHOIS information
- `321-323`: Channel list
- `331-333`: Topic information
- `352-353`: WHO/NAMES replies
- `375-376`: MOTD
- `401-502`: Error messages

## Channel Modes

| Mode | Description |
|------|-------------|
| `+o` | Channel operator |
| `+v` | Voice (can speak in moderated) |
| `+i` | Invite only |
| `+m` | Moderated |
| `+n` | No external messages |
| `+t` | Topic lock |
| `+k` | Channel key (password) |
| `+l` | User limit |
| `+b` | Ban mask |
| `+s` | Secret |
| `+p` | Private |

## User Modes

| Mode | Description |
|------|-------------|
| `+o` | IRC operator |
| `+i` | Invisible |
| `+w` | Receives wallops |
| `+s` | Receives server notices |
