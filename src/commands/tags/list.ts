import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { fetchPage, fetchAllPages } from '../../lib/pagination.js';
import { formatOutput, OutputFormat } from '../../lib/formatter.js';

export default class TagsList extends Command {
  static description = 'List tags';

  static examples = ['$ aircall tags list'];

  static flags = {
    page: Flags.integer({ description: 'Page number', default: 1 }),
    'per-page': Flags.integer({ description: 'Results per page (max 50)', default: 20 }),
    all: Flags.boolean({ description: 'Fetch all pages', default: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(TagsList);
    const client = createClient();

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Color', key: 'color' },
    ];

    if (flags.all) {
      const all = await fetchAllPages(client, '/v1/tags', 'tags');
      this.log(formatOutput(all, columns, flags.format as OutputFormat));
    } else {
      const result = await fetchPage(client, '/v1/tags', 'tags', {
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
