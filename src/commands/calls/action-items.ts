import { Args, Command, Flags } from '@oclif/core';
import { createClient, validatePathParam } from '../../lib/client.js';
import { formatOutput, formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class CallsActionItems extends Command {
  static description = 'Get the action items extracted from a call';

  static examples = [
    '$ aircall calls action-items 12345',
    '$ aircall calls action-items 12345 --format json',
  ];

  static args = {
    call_id: Args.string({ description: 'The call ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CallsActionItems);
    const client = createClient();
    const callId = validatePathParam(args.call_id, 'call_id');

    const response = await client.get(`/v1/calls/${callId}/action_items`);
    const data = response.data;

    if (flags.format === 'json') {
      this.log(JSON.stringify(data, null, 2));
      return;
    }

    if (data.action_items && Array.isArray(data.action_items)) {
      const columns = [
        { header: 'Content', key: 'content' },
      ];
      this.log(`Call ID: ${data.call_id}\n`);
      this.log(formatOutput(data.action_items, columns, 'table'));
    } else {
      this.log(formatSingle(data, 'table'));
    }
  }
}
