import { Args, Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class CallsPlaybook extends Command {
  static description = 'Get the playbook result of a call (AI Assist Pro)';

  static examples = [
    '$ aircall calls playbook 12345',
    '$ aircall calls playbook 12345 --format json',
  ];

  static args = {
    call_id: Args.string({ description: 'The call ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CallsPlaybook);
    const client = createClient();

    const response = await client.get(`/v1/calls/${args.call_id}/playbook_result`);
    this.log(formatSingle(response.data, flags.format as OutputFormat));
  }
}
