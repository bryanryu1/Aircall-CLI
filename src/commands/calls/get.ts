import { Args, Command, Flags } from '@oclif/core';
import { createClient, validatePathParam } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class CallsGet extends Command {
  static description = 'Get details for a specific call';

  static examples = ['$ aircall calls get 12345'];

  static args = {
    call_id: Args.string({ description: 'The call ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CallsGet);
    const client = createClient();
    const callId = validatePathParam(args.call_id, 'call_id');

    const response = await client.get(`/v1/calls/${callId}`);
    this.log(formatSingle(response.data.call || response.data, flags.format as OutputFormat));
  }
}
