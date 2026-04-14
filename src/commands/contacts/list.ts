import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { fetchPage, fetchAllPages } from '../../lib/pagination.js';
import { formatOutput, OutputFormat } from '../../lib/formatter.js';

export default class ContactsList extends Command {
  static description = 'List contacts';

  static examples = ['$ aircall contacts list', '$ aircall contacts list --all --format json'];

  static flags = {
    page: Flags.integer({ description: 'Page number', default: 1 }),
    'per-page': Flags.integer({ description: 'Results per page (max 50)', default: 20 }),
    all: Flags.boolean({ description: 'Fetch all pages', default: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
    from: Flags.string({ description: 'Filter from date (UNIX timestamp)' }),
    to: Flags.string({ description: 'Filter to date (UNIX timestamp)' }),
    order: Flags.string({ description: 'Sort order', options: ['asc', 'desc'] }),
    'order-by': Flags.string({ description: 'Sort field', options: ['created_at', 'updated_at'] }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsList);
    const client = createClient();

    const params: Record<string, string | number | undefined> = {
      from: flags.from,
      to: flags.to,
      order: flags.order,
      order_by: flags['order-by'],
    };

    const columns = [
      { header: 'ID', key: 'id' },
      {
        header: 'Name',
        key: 'direct_link',
        formatter: (_: any, row: any) => [row.first_name, row.last_name].filter(Boolean).join(' ') || '-',
      },
      { header: 'Company', key: 'company_name' },
      {
        header: 'Email',
        key: 'emails',
        formatter: (v: any) => (Array.isArray(v) && v.length > 0 ? v[0].value || v[0] : '-'),
      },
      {
        header: 'Phone',
        key: 'phone_numbers',
        formatter: (v: any) => (Array.isArray(v) && v.length > 0 ? v[0].value || v[0] : '-'),
      },
    ];

    if (flags.all) {
      this.log('Fetching all contacts...');
      const all = await fetchAllPages(client, '/v1/contacts', 'contacts', params, (page, total) => {
        this.log(`  Page ${page} (${Math.min(page * 50, total)}/${total})...`);
      });
      this.log(formatOutput(all, columns, flags.format as OutputFormat));
    } else {
      const result = await fetchPage(client, '/v1/contacts', 'contacts', {
        ...params,
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
