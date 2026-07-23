import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Connection, ConnectionStatus } from '../src/models/Connection.js';
import { MemoryConnectionRepository } from '../src/repositories/memory/MemoryConnectionRepository.js';

describe('Connection', () => {
  it('should have correct initial state', () => {
    const mockSocket = {
      remoteAddress: '127.0.0.1',
      remotePort: 12345,
      destroyed: false,
      write: () => true,
      end: () => {},
      destroy: () => {},
      once: () => {},
      on: () => {},
      setKeepAlive: () => {},
      setNoDelay: () => {},
      setTimeout: () => {},
    } as any;

    const conn = new Connection('test-id', mockSocket);
    expect(conn.id).toBe('test-id');
    expect(conn.remoteAddress).toBe('127.0.0.1');
    expect(conn.remotePort).toBe(12345);
    expect(conn.status).toBe(ConnectionStatus.CONNECTED);
    expect(conn.isConnected).toBe(true);
  });

  it('should report disconnected status correctly', () => {
    const mockSocket = {
      remoteAddress: '127.0.0.1',
      remotePort: 12345,
      destroyed: true,
      write: () => true,
      end: () => {},
      destroy: () => {},
      once: () => {},
      on: () => {},
      setKeepAlive: () => {},
      setNoDelay: () => {},
      setTimeout: () => {},
    } as any;

    const conn = new Connection('test-id', mockSocket);
    expect(conn.isConnected).toBe(false);
  });
});

describe('MemoryConnectionRepository', () => {
  let repo: MemoryConnectionRepository;

  beforeEach(() => {
    repo = new MemoryConnectionRepository();
  });

  it('should save and retrieve connection', async () => {
    const mockSocket = {
      remoteAddress: '127.0.0.1',
      remotePort: 12345,
      destroyed: false,
      write: () => true,
      end: () => {},
      destroy: () => {},
      once: () => {},
      on: () => {},
      setKeepAlive: () => {},
      setNoDelay: () => {},
      setTimeout: () => {},
    } as any;

    const conn = new Connection('test-id', mockSocket);
    await repo.save(conn);

    const found = await repo.findById('test-id');
    expect(found).toBeDefined();
    expect(found?.id).toBe('test-id');
  });

  it('should return undefined for non-existent id', async () => {
    const found = await repo.findById('non-existent');
    expect(found).toBeUndefined();
  });

  it('should delete connection', async () => {
    const mockSocket = {
      remoteAddress: '127.0.0.1',
      remotePort: 12345,
      destroyed: false,
      write: () => true,
      end: () => {},
      destroy: () => {},
      once: () => {},
      on: () => {},
      setKeepAlive: () => {},
      setNoDelay: () => {},
      setTimeout: () => {},
    } as any;

    const conn = new Connection('test-id', mockSocket);
    await repo.save(conn);

    const deleted = await repo.delete('test-id');
    expect(deleted).toBe(true);

    const found = await repo.findById('test-id');
    expect(found).toBeUndefined();
  });

  it('should count connections', async () => {
    expect(await repo.count()).toBe(0);

    const mockSocket = {
      remoteAddress: '127.0.0.1',
      remotePort: 12345,
      destroyed: false,
      write: () => true,
      end: () => {},
      destroy: () => {},
      once: () => {},
      on: () => {},
      setKeepAlive: () => {},
      setNoDelay: () => {},
      setTimeout: () => {},
    } as any;

    await repo.save(new Connection('1', mockSocket));
    await repo.save(new Connection('2', mockSocket));

    expect(await repo.count()).toBe(2);
  });
});
