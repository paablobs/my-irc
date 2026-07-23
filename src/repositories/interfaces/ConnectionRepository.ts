import type { Connection } from '../../models/Connection.js';

export interface ConnectionRepository {
  findById(id: string): Promise<Connection | undefined>;
  save(connection: Connection): Promise<void>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Connection[]>;
  count(): Promise<number>;
}
