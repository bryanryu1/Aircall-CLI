import { Args, Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class ContactsGet extends Command {
  static description = 'Get details for a specific contact';

  static examples = ['$ aircall contacts get 12345'];

  static args = {
    id: Args.string({ description: 'The contact ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContactsGet);
    const client = createClient();

    const response = await client.get(`/v1/contacts/${args.id}`);
    this.log(formatSingle(response.data.contact || response.data, flags.format as OutputFormat));
  }
}
