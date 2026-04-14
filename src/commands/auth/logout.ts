import { Command } from '@oclif/core';
import { clearCredentials } from '../../lib/config.js';

export default class AuthLogout extends Command {
  static description = 'Remove stored Aircall API credentials';

  static examples = ['$ aircall auth logout'];

  async run(): Promise<void> {
    await this.parse(AuthLogout);
    clearCredentials();
    this.log('');
    this.log('  ✓ Credentials removed.');
    this.log('');
  }
}
