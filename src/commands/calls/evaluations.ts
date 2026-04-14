import { Args, Command, Flags } from '@oclif/core';
import { createClient, validatePathParam } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class CallsEvaluations extends Command {
  static description = 'Get evaluation data for a call';

  static examples = [
    '$ aircall calls evaluations 12345',
    '$ aircall calls evaluations 12345 --format json',
  ];

  static args = {
    call_id: Args.string({ description: 'The call ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CallsEvaluations);
    const client = createClient();
    const callId = validatePathParam(args.call_id, 'call_id');

    const response = await client.get(`/v1/calls/${callId}/evaluations`);
    this.log(formatSingle(response.data, flags.format as OutputFormat));
  }
}
