const NON_EMPTY_PLACEHOLDER = /^REPLACE_WITH_/;

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || NON_EMPTY_PLACEHOLDER.test(value)) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (publishableKey && !NON_EMPTY_PLACEHOLDER.test(publishableKey)) {
    return publishableKey;
  }

  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getAnthropicApiKey(): string {
  return readRequiredEnv("ANTHROPIC_API_KEY");
}
