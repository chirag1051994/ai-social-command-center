const NON_EMPTY_PLACEHOLDER = /^REPLACE_WITH_/;

function normalizeEnvValue(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || NON_EMPTY_PLACEHOLDER.test(normalized)) {
    return null;
  }

  return normalized;
}

function readRequiredEnv(name: string, value: string | undefined): string {
  const normalized = normalizeEnvValue(value);

  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalized;
}

function getPublicSupabasePublishableKey(): string | null {
  return normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
}

function getPublicSupabaseAnonKey(): string | null {
  return normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseEnv(): boolean {
  return Boolean(normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)) &&
    Boolean(getPublicSupabasePublishableKey() ?? getPublicSupabaseAnonKey());
}

export function getSupabaseUrl(): string {
  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return (
    getPublicSupabasePublishableKey() ??
    readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function getAnthropicApiKey(): string {
  return readRequiredEnv("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY);
}
