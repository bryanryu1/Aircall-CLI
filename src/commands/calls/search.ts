import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { fetchPage, fetchAllPages } from '../../lib/pagination.js';
import { formatOutput, OutputFormat } from '../../lib/formatter.js';

export default class CallsSearch extends Command {
  static description = 'Search calls with filters';

  static examples = [
    '$ aircall calls search --direction inbound',
    '$ aircall calls search --from 1680000000 --to 1680086400',
  ];

  static flags = {
    page: Flags.integer({ description: 'Page number', default: 1 }),
    'per-page': Flags.integer({ description: 'Results per page (max 50)', default: 20 }),
    all: Flags.boolean({ description: 'Fetch all pages', default: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
    direction: Flags.string({ description: 'Filter by direction', options: ['inbound', 'outbound'] }),
    from: Flags.string({ description: 'From date (UNIX timestamp)' }),
    to: Flags.string({ description: 'To date (UNIX timestamp)' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(CallsSearch);
    const client = createClient();

    const params: Record<string, string | number | undefined> = {
      direction: flags.direction,
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
      const allCalls = await fetchAllPages(client, '/v1/calls/search', 'calls', params);
      this.log(formatOutput(allCalls, columns, flags.format as OutputFormat));
    } else {
      const result = await fetchPage(client, '/v1/calls/search', 'calls', {
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
