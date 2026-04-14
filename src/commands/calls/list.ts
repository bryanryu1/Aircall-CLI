import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { fetchPage, fetchAllPages } from '../../lib/pagination.js';
import { formatOutput, OutputFormat } from '../../lib/formatter.js';

export default class CallsList extends Command {
  static description = 'List calls';

  static examples = [
    '$ aircall calls list',
    '$ aircall calls list --per-page 50',
    '$ aircall calls list --all',
    '$ aircall calls list --format json',
  ];

  static flags = {
    page: Flags.integer({ description: 'Page number', default: 1 }),
    'per-page': Flags.integer({ description: 'Results per page (max 50)', default: 20 }),
    all: Flags.boolean({ description: 'Fetch all pages (auto-paginate)', default: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
    from: Flags.string({ description: 'Filter calls from this date (UNIX timestamp)' }),
    to: Flags.string({ description: 'Filter calls to this date (UNIX timestamp)' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(CallsList);
    const client = createClient();

    const params: Record<string, string | number | undefined> = {
      from: flags.from,
      to: flags.to,
    };

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'Direction', key: 'direction' },
      { header: 'Status', key: 'status' },
      {
        header: 'Duration',
        key: 'duration',
        formatter: (v: number) => (v ? `${Math.floor(v / 60)}m ${v % 60}s` : '-'),
      },
      {
        header: 'Started At',
        key: 'started_at',
        formatter: (v: number) => (v ? new Date(v * 1000).toLocaleString() : '-'),
      },
      { header: 'Number', key: 'raw_digits' },
    ];

    if (flags.all) {
      this.log('Fetching all calls...');
      const allCalls = await fetchAllPages(client, '/v1/calls', 'calls', params, (page, total) => {
        this.log(`  Page ${page} (${Math.min(page * 50, total)}/${total})...`);
      });
      this.log(formatOutput(allCalls, columns, flags.format as OutputFormat));
    } else {
      const result = await fetchPage(client, '/v1/calls', 'calls', {
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
