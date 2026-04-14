import { Args, Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class TeamsGet extends Command {
  static description = 'Get details for a specific team';

  static args = {
    id: Args.string({ description: 'The team ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TeamsGet);
    const client = createClient();
    const response = await client.get(`/v1/teams/${args.id}`);
    this.log(formatSingle(response.data.team || response.data, flags.format as OutputFormat));
  }
}
