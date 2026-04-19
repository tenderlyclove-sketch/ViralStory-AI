import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: Env) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  return env.OPENROUTER_API_KEY || cloudflareEnv.OPENROUTER_API_KEY;
}
