import { Args, Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class CallsCustomSummary extends Command {
  static description = 'Get the custom summary result of a call (AI Assist Pro)';

  static examples = [
    '$ aircall calls custom-summary 12345',
    '$ aircall calls custom-summary 12345 --format json',
  ];

  static args = {
    call_id: Args.string({ description: 'The call ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CallsCustomSummary);
    const client = createClient();

    const response = await client.get(`/v1/calls/${args.call_id}/custom_summary_result`);
    this.log(formatSingle(response.data, flags.format as OutputFormat));
  }
}
