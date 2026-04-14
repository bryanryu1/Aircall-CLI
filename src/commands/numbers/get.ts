import { Args, Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class NumbersGet extends Command {
  static description = 'Get details for a specific number';

  static examples = ['$ aircall numbers get 12345'];

  static args = {
    id: Args.string({ description: 'The number ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(NumbersGet);
    const client = createClient();

    const response = await client.get(`/v1/numbers/${args.id}`);
    this.log(formatSingle(response.data.number || response.data, flags.format as OutputFormat));
  }
}
