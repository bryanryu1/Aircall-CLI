import { Args, Command, Flags } from '@oclif/core';
import { createClient, validatePathParam } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class CallsTranscription extends Command {
  static description = 'Get the transcription of a call';

  static examples = [
    '$ aircall calls transcription 12345',
    '$ aircall calls transcription 12345 --format json',
  ];

  static args = {
    call_id: Args.string({ description: 'The call ID', required: true }),
  };

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CallsTranscription);
    const client = createClient();
    const callId = validatePathParam(args.call_id, 'call_id');

    const response = await client.get(`/v1/calls/${callId}/transcription`);
    this.log(formatSingle(response.data, flags.format as OutputFormat));
  }
}
