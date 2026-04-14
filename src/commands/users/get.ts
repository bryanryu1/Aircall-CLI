import { Args, Command, Flags } from '@oclif/core';
import { createClient, validatePathParam } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class UsersGet extends Command {
  static description = 'Get details for a specific user';

  static examples = ['$ aircall users get 12345'];

  static args = {
    user_id: Args.string({ description: 'The user ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(UsersGet);
    const client = createClient();
    const userId = validatePathParam(args.user_id, 'user_id');

    const response = await client.get(`/v1/users/${userId}`);
    this.log(formatSingle(response.data.user || response.data, flags.format as OutputFormat));
  }
}
