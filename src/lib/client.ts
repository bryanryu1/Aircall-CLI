import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getCredentials, getVersion } from './config.js';

const MAX_RETRIES = 3;
const RETRY_SYMBOL = Symbol('retryCount');

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

  // Response interceptor for rate limit tracking + retry with max attempts
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
        const config = error.config as any;
        const retryCount = config[RETRY_SYMBOL] || 0;

        if (retryCount >= MAX_RETRIES) {
          throw new Error(
            `Rate limited after ${MAX_RETRIES} retries. The API rate limit is 60 requests/minute. Wait a moment and try again.`,
          );
        }

        const resetTime = error.response.headers['x-aircallapi-reset'];
        if (resetTime) {
          const waitMs = parseInt(resetTime, 10) * 1000 - Date.now();
          if (waitMs > 0 && waitMs < 120000) {
            process.stderr.write(
              `Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s... (retry ${retryCount + 1}/${MAX_RETRIES})\n`,
            );
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            config[RETRY_SYMBOL] = retryCount + 1;
            return client.request(config);
          }
        }

        // No valid reset header — exponential backoff
        const backoffMs = Math.min(1000 * 2 ** retryCount, 60000);
        process.stderr.write(
          `Rate limited. Retrying in ${Math.ceil(backoffMs / 1000)}s... (retry ${retryCount + 1}/${MAX_RETRIES})\n`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        config[RETRY_SYMBOL] = retryCount + 1;
        return client.request(config);
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

/**
 * Validates and sanitizes a path parameter (e.g., call_id, contact_id).
 * Prevents path traversal and injection by ensuring the value is a safe identifier.
 */
export function validatePathParam(value: string, paramName: string): string {
  const sanitized = value.trim();

  // Must be alphanumeric, dashes, or underscores only
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new Error(`Invalid ${paramName}: "${value}". Must contain only alphanumeric characters, dashes, or underscores.`);
  }

  return encodeURIComponent(sanitized);
}

export function getRateLimitInfo() {
  return { remaining: rateLimitRemaining, reset: rateLimitReset };
}
