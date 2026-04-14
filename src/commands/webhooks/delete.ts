import { Args, Command } from '@oclif/core';
import { createClient } from '../../lib/client.js';

export default class WebhooksDelete extends Command {
  static description = 'Delete a webhook';

  static examples = ['$ aircall webhooks delete 12345'];

  static args = {
    id: Args.string({ description: 'The webhook ID', required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(WebhooksDelete);
    const client = createClient();
    await client.delete(`/v1/webhooks/${args.id}`);
    this.log(`Webhook ${args.id} deleted.`);
  }
}
