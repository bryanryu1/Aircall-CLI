import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { fetchPage, fetchAllPages } from '../../lib/pagination.js';
import { formatOutput, OutputFormat } from '../../lib/formatter.js';

export default class ContactsSearch extends Command {
  static description = 'Search contacts by phone number or email';

  static examples = [
    '$ aircall contacts search --phone +15551234567',
    '$ aircall contacts search --email john@example.com',
  ];

  static flags = {
    page: Flags.integer({ description: 'Page number', default: 1 }),
    'per-page': Flags.integer({ description: 'Results per page (max 50)', default: 20 }),
    all: Flags.boolean({ description: 'Fetch all pages', default: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
    phone: Flags.string({ description: 'Search by phone number' }),
    email: Flags.string({ description: 'Search by email' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsSearch);
    const client = createClient();

    const params: Record<string, string | number | undefined> = {
      phone_number: flags.phone,
      email: flags.email,
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
      const all = await fetchAllPages(client, '/v1/contacts/search', 'contacts', params);
      this.log(formatOutput(all, columns, flags.format as OutputFormat));
    } else {
      const result = await fetchPage(client, '/v1/contacts/search', 'contacts', {
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
