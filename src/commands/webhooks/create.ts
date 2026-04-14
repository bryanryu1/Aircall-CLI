import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class WebhooksCreate extends Command {
  static description = 'Create a new webhook';

  static examples = [
    '$ aircall webhooks create --url https://example.com/webhook --events call.created,call.ended',
  ];

  static flags = {
    url: Flags.string({ description: 'Webhook URL (must be HTTPS)', required: true }),
    events: Flags.string({ description: 'Comma-separated list of event types', required: true }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksCreate);
    const client = createClient();

    const body = {
      custom_name: 'aircall-cli-webhook',
      url: flags.url,
      events: flags.events.split(',').map((e) => e.trim()),
    };

    const response = await client.post('/v1/webhooks', body);
    this.log('Webhook created.');
    this.log(formatSingle(response.data.webhook || response.data, flags.format as OutputFormat));
  }
}
