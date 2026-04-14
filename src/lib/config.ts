import Conf from 'conf';

interface AircallConfig {
  apiId: string;
  apiToken: string;
  baseUrl: string;
}

const config = new Conf<AircallConfig>({
  projectName: 'aircall-cli',
  defaults: {
    apiId: '',
    apiToken: '',
    baseUrl: 'https://api.aircall.io',
  },
});

export function getCredentials(): { apiId: string; apiToken: string; baseUrl: string } {
  const apiId = config.get('apiId');
  const apiToken = config.get('apiToken');
  const baseUrl = config.get('baseUrl');
  if (!apiId || !apiToken) {
    throw new Error('Not authenticated. Run `aircall auth login` first.');
  }
  return { apiId, apiToken, baseUrl };
}

export function setCredentials(apiId: string, apiToken: string, baseUrl?: string): void {
  config.set('apiId', apiId);
  config.set('apiToken', apiToken);
  if (baseUrl) config.set('baseUrl', baseUrl);
}

export function clearCredentials(): void {
  config.clear();
}

export { config };
