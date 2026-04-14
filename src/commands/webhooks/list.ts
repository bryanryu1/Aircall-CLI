import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { fetchPage, fetchAllPages } from '../../lib/pagination.js';
import { formatOutput, OutputFormat } from '../../lib/formatter.js';

export default class WebhooksList extends Command {
  static description = 'List webhooks';

  static examples = ['$ aircall webhooks list'];

  static flags = {
    page: Flags.integer({ description: 'Page number', default: 1 }),
    'per-page': Flags.integer({ description: 'Results per page (max 50)', default: 20 }),
    all: Flags.boolean({ description: 'Fetch all pages', default: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WebhooksList);
    const client = createClient();

    const columns = [
      { header: 'ID', key: 'webhook_id' },
      { header: 'URL', key: 'direct_link' },
      { header: 'Active', key: 'active' },
      {
        header: 'Events',
        key: 'events',
        formatter: (v: any) => (Array.isArray(v) ? v.join(', ') : '-'),
      },
      {
        header: 'Created',
        key: 'created_at',
        formatter: (v: number) => (v ? new Date(v * 1000).toLocaleDateString() : '-'),
      },
    ];

    if (flags.all) {
      const all = await fetchAllPages(client, '/v1/webhooks', 'webhooks');
      this.log(formatOutput(all, columns, flags.format as OutputFormat));
    } else {
      const result = await fetchPage(client, '/v1/webhooks', 'webhooks', {
        page: flags.page,
        per_page: flags['per-page'],
      });
      this.log(formatOutput(result.data, columns, flags.format as OutputFormat));
      this.log(
        `\nPage ${result.meta.current_page} of ${Math.ceil(result.meta.total / result.meta.per_page)} (${result.meta.total} total)`,
      );
    }
  }
}
