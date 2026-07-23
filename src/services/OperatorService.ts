import type { User } from '../models/User.js';
import type { ServerStateContainer } from '../state/serverState.js';

export class OperatorService {
  private readonly operators = new Map<string, { password: string; host: string }>();

  constructor(private readonly state: ServerStateContainer) {}

  addOperator(username: string, password: string, host: string): void {
    this.operators.set(username, { password, host });
  }

  removeOperator(username: string): boolean {
    return this.operators.delete(username);
  }

  isOperator(username: string): boolean {
    return this.operators.has(username);
  }

  authenticate(username: string, password: string, host: string): boolean {
    const op = this.operators.get(username);
    if (!op) {
      return false;
    }
    if (op.password !== password) {
      return false;
    }
    if (op.host !== '*' && op.host !== host) {
      return false;
    }
    return true;
  }

  async grantOperator(user: User): Promise<void> {
    user.addMode('o');
    await this.state.users.save(user);
    this.state.server.operatorCount++;
  }

  async revokeOperator(user: User): Promise<void> {
    user.removeMode('o');
    await this.state.users.save(user);
    this.state.server.operatorCount = Math.max(0, this.state.server.operatorCount - 1);
  }
}
