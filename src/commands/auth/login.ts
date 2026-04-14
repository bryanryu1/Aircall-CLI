import { Command, Flags } from '@oclif/core';
import { input, password } from '@inquirer/prompts';
import axios from 'axios';
import { setCredentials } from '../../lib/config.js';

export default class AuthLogin extends Command {
  static description = 'Authenticate with the Aircall API using your API credentials';

  static examples = [
    '$ aircall auth login',
    '$ aircall auth login --api-id YOUR_API_ID --api-token YOUR_API_TOKEN',
  ];

  static flags = {
    'api-id': Flags.string({
      description: 'Your Aircall API ID (skips interactive prompt)',
      required: false,
    }),
    'api-token': Flags.string({
      description: 'Your Aircall API token (skips interactive prompt)',
      required: false,
    }),
    'base-url': Flags.string({
      description: 'API base URL',
      default: 'https://api.aircall.io',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthLogin);
    let { 'api-id': apiId, 'api-token': apiToken, 'base-url': baseUrl } = flags;

    // Interactive prompts if flags not provided
    if (!apiId || !apiToken) {
      this.log('');
      this.log('  Aircall CLI Authentication');
      this.log('  ─────────────────────────');
      this.log('  Get your API credentials from the Aircall Dashboard:');
      this.log('  https://dashboard.aircall.io/integrations/api-keys');
      this.log('');

      if (!apiId) {
        apiId = await input({
          message: 'API ID:',
          validate: (val) => (val.trim().length > 0 ? true : 'API ID is required'),
        });
      }

      if (!apiToken) {
        apiToken = await password({
          message: 'API Token:',
          mask: '*',
          validate: (val) => (val.trim().length > 0 ? true : 'API Token is required'),
        });
      }
    }

    this.log('');
    this.log('Validating credentials...');

    const credentials = Buffer.from(`${apiId}:${apiToken}`).toString('base64');

    try {
      const response = await axios.get(`${baseUrl}/v1/ping`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          'User-Agent': `aircall-cli/0.1.0 (https://github.com/bryanryu1/aircall-cli)`,
        },
      });

      if (response.status === 200) {
        setCredentials(apiId!, apiToken!, baseUrl);

        // Try to get company info for a nice confirmation
        try {
          const companyRes = await axios.get(`${baseUrl}/v1/company`, {
            headers: {
              Authorization: `Basic ${credentials}`,
              'User-Agent': `aircall-cli/0.1.0 (https://github.com/bryanryu1/aircall-cli)`,
            },
          });

          const company = companyRes.data?.company;
          if (company) {
            this.log('');
            this.log('  ✓ Authenticated successfully');
            this.log(`  Company:  ${company.name}`);
            if (company.users_count) this.log(`  Users:    ${company.users_count}`);
            if (company.numbers_count) this.log(`  Numbers:  ${company.numbers_count}`);
            this.log('');
            this.log('  Credentials saved. You can now use the CLI.');
            this.log('  Try: aircall calls list');
            this.log('');
            return;
          }
        } catch {
          // Company info is nice-to-have
        }

        this.log('');
        this.log('  ✓ Authenticated successfully. Credentials saved.');
        this.log('  Try: aircall calls list');
        this.log('');
      }
    } catch (error: any) {
      this.log('');
      if (error.response?.status === 401) {
        this.error('Authentication failed. Check your API ID and token.\n  Get them at: https://dashboard.aircall.io/integrations/api-keys');
      }
      this.error(`Connection failed: ${error.message}`);
    }
  }
}
