import { Command } from '@oclif/core';
import { config } from '../../lib/config.js';

export default class AuthStatus extends Command {
  static description = 'Check current authentication status';

  static examples = ['$ aircall auth status'];

  async run(): Promise<void> {
    await this.parse(AuthStatus);
    const apiId = config.get('apiId');
    const baseUrl = config.get('baseUrl');

    this.log('');
    if (apiId) {
      this.log('  ✓ Authenticated');
      this.log(`  API ID:    ${apiId.slice(0, 6)}...${apiId.slice(-4)}`);
      this.log(`  Base URL:  ${baseUrl}`);
      this.log(`  Config:    ${config.path}`);
    } else {
      this.log('  ✗ Not authenticated');
      this.log('  Run: aircall auth login');
    }
    this.log('');
  }
}
