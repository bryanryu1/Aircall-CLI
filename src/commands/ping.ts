import { Command } from '@oclif/core';
import { createClient } from '../lib/client.js';

export default class Ping extends Command {
  static description = 'Test your connection to the Aircall API';

  static examples = ['$ aircall ping'];

  async run(): Promise<void> {
    await this.parse(Ping);
    const client = createClient();
    try {
      const response = await client.get('/v1/ping');
      this.log(`Connected. Status: ${response.status}`);
      if (response.data) {
        this.log(JSON.stringify(response.data, null, 2));
      }
    } catch (error: any) {
      this.error(`Ping failed: ${error.message}`);
    }
  }
}
