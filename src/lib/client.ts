import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getCredentials } from './config.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Read version from package.json
function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

let rateLimitRemaining: number | null = null;
let rateLimitReset: number | null = null;

export function createClient(): AxiosInstance {
  const { apiId, apiToken, baseUrl } = getCredentials();
  const version = getVersion();
  const credentials = Buffer.from(`${apiId}:${apiToken}`).toString('base64');

  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Basic ${credentials}`,
      'User-Agent': `aircall-cli/${version} (https://github.com/bryanryu1/aircall-cli; node/${process.version})`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Response interceptor for rate limit tracking
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const remaining = response.headers['x-aircallapi-remaining'];
      const reset = response.headers['x-aircallapi-reset'];
      if (remaining !== undefined) rateLimitRemaining = parseInt(remaining as string, 10);
      if (reset !== undefined) rateLimitReset = parseInt(reset as string, 10);
      return response;
    },
    async (error) => {
      if (error.response?.status === 429) {
        const resetTime = error.response.headers['x-aircallapi-reset'];
        if (resetTime) {
          const waitMs = parseInt(resetTime, 10) * 1000 - Date.now();
          if (waitMs > 0 && waitMs < 120000) {
            process.stderr.write(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...\n`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            return client.request(error.config);
          }
        }
      }
      throw error;
    },
  );

  // Request interceptor for proactive rate limit waiting
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (rateLimitRemaining !== null && rateLimitRemaining <= 1 && rateLimitReset !== null) {
      const waitMs = rateLimitReset * 1000 - Date.now();
      if (waitMs > 0 && waitMs < 120000) {
        process.stderr.write(`Approaching rate limit. Waiting ${Math.ceil(waitMs / 1000)}s...\n`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
    return config;
  });

  return client;
}

export function getRateLimitInfo() {
  return { remaining: rateLimitRemaining, reset: rateLimitReset };
}
