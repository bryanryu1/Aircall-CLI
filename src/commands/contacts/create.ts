import { Command, Flags } from '@oclif/core';
import { createClient } from '../../lib/client.js';
import { formatSingle, OutputFormat } from '../../lib/formatter.js';

export default class ContactsCreate extends Command {
  static description = 'Create a new contact';

  static examples = [
    '$ aircall contacts create --first-name John --last-name Doe --phone +15551234567',
    '$ aircall contacts create --first-name Jane --email jane@example.com --company-name "Acme Inc"',
  ];

  static flags = {
    'first-name': Flags.string({ description: 'First name' }),
    'last-name': Flags.string({ description: 'Last name' }),
    'company-name': Flags.string({ description: 'Company name' }),
    phone: Flags.string({ description: 'Phone number' }),
    email: Flags.string({ description: 'Email address' }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json'], default: 'table' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ContactsCreate);
    const client = createClient();

    const body: Record<string, any> = {};
    if (flags['first-name']) body.first_name = flags['first-name'];
    if (flags['last-name']) body.last_name = flags['last-name'];
    if (flags['company-name']) body.company_name = flags['company-name'];
    if (flags.phone) body.phone_numbers = [{ label: 'Work', value: flags.phone }];
    if (flags.email) body.emails = [{ label: 'Work', value: flags.email }];

    const response = await client.post('/v1/contacts', body);
    this.log('Contact created.');
    this.log(formatSingle(response.data.contact || response.data, flags.format as OutputFormat));
  }
}
