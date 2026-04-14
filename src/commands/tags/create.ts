import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class TagsCreate extends Command {
  static description = 'Create a new tag';

  static examples = ['$ aircall tags create --name "VIP" --color "#FF0000"'];

  static flags = {
    name: Flags.string({ description: 'Tag name', required: true }),
    color: Flags.string({ description: 'Tag color (hex)', required: false }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(TagsCreate);
    const client = createClient();

    const body: Record<string, any> = { name: flags.name };
    if (flags.color) body.color = flags.color;

    const response = await client.post('/v1/tags', body);
    this.log('Tag created.');
    this.log(formatSingle(response.data.tag || response.data, flags.format as OutputFormat));
  }
}
