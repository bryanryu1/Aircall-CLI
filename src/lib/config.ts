import Conf from 'conf';
import { chmodSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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

export function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

/**
 * Lock down config file to owner-only read/write (0600).
 * Prevents other users on shared machines from reading credentials.
 */
function lockConfigPermissions(): void {
  try {
    chmodSync(config.path, 0o600);
  } catch {
    // May fail on Windows — non-critical
  }
}

export function getCredentials(): { apiId: string; apiToken: string; baseUrl: string } {
  // Allow env var override for CI/scripting (no shell history exposure)
  const apiId = process.env.AIRCALL_API_ID || config.get('apiId');
  const apiToken = process.env.AIRCALL_API_TOKEN || config.get('apiToken');
  const baseUrl = process.env.AIRCALL_BASE_URL || config.get('baseUrl');
  if (!apiId || !apiToken) {
    throw new Error('Not authenticated. Run `aircall auth login` first.');
  }
  return { apiId, apiToken, baseUrl };
}

export function setCredentials(apiId: string, apiToken: string, baseUrl?: string): void {
  config.set('apiId', apiId);
  config.set('apiToken', apiToken);
  if (baseUrl) config.set('baseUrl', baseUrl);
  lockConfigPermissions();
}

export function clearCredentials(): void {
  config.clear();
}

export { config };
