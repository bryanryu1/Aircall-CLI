import { Args, Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class TagsGet extends Command {
  static description = 'Get details for a specific tag';

  static args = {
    id: Args.string({ description: 'The tag ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TagsGet);
    const client = createClient();
    const response = await client.get(`/v1/tags/${args.id}`);
    this.log(formatSingle(response.data.tag || response.data, flags.format as OutputFormat));
  }
}
