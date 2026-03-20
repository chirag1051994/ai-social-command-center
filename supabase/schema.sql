create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  company_name text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'enterprise')),
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.social_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest')),
  account_name text not null,
  account_handle text not null,
  avatar_url text,
  followers_count integer not null default 0 check (followers_count >= 0),
  is_connected boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  color text not null,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  content text not null,
  media_urls text[] not null default '{}',
  platforms text[] not null,
  hashtags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  ai_generated boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_content_length check (char_length(content) between 1 and 3000),
  constraint posts_platforms_not_empty check (coalesce(array_length(platforms, 1), 0) > 0),
  constraint posts_platforms_allowed check (
    platforms <@ array['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest']::text[]
  )
);

create table if not exists public.post_analytics (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts (id) on delete cascade,
  platform text not null check (platform in ('twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest')),
  impressions integer not null default 0 check (impressions >= 0),
  reach integer not null default 0 check (reach >= 0),
  likes integer not null default 0 check (likes >= 0),
  comments integer not null default 0 check (comments >= 0),
  shares integer not null default 0 check (shares >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  engagement_rate numeric(5, 2) not null default 0 check (engagement_rate >= 0),
  recorded_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_analytics (
  id uuid primary key default uuid_generate_v4(),
  social_account_id uuid not null references public.social_accounts (id) on delete cascade,
  date date not null,
  followers integer not null default 0 check (followers >= 0),
  following integer not null default 0 check (following >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  reach integer not null default 0 check (reach >= 0),
  profile_visits integer not null default 0 check (profile_visits >= 0),
  new_followers integer not null default 0,
  unique (social_account_id, date)
);

create table if not exists public.inbox_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  social_account_id uuid references public.social_accounts (id) on delete cascade,
  platform text not null check (platform in ('twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest')),
  message_type text not null check (message_type in ('dm', 'mention', 'comment', 'reply')),
  sender_name text not null,
  sender_handle text,
  sender_avatar text,
  content text not null,
  is_read boolean not null default false,
  is_replied boolean not null default false,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  received_at timestamptz not null default timezone('utc', now())
);

create index if not exists posts_user_id_status_idx on public.posts (user_id, status);
create index if not exists posts_scheduled_at_idx on public.posts (scheduled_at);
create index if not exists post_analytics_post_id_idx on public.post_analytics (post_id);
create index if not exists account_analytics_social_account_id_date_idx on public.account_analytics (social_account_id, date);
create index if not exists inbox_messages_user_id_is_read_idx on public.inbox_messages (user_id, is_read);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, company_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_posts_updated_at on public.posts;
create trigger handle_posts_updated_at
  before update on public.posts
  for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.campaigns enable row level security;
alter table public.posts enable row level security;
alter table public.post_analytics enable row level security;
alter table public.account_analytics enable row level security;
alter table public.inbox_messages enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "social_accounts_manage_own" on public.social_accounts;
create policy "social_accounts_manage_own"
  on public.social_accounts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "campaigns_manage_own" on public.campaigns;
create policy "campaigns_manage_own"
  on public.campaigns
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "posts_manage_own" on public.posts;
create policy "posts_manage_own"
  on public.posts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "post_analytics_select_own" on public.post_analytics;
create policy "post_analytics_select_own"
  on public.post_analytics
  for select
  using (
    exists (
      select 1
      from public.posts
      where public.posts.id = public.post_analytics.post_id
        and public.posts.user_id = auth.uid()
    )
  );

drop policy if exists "account_analytics_select_own" on public.account_analytics;
create policy "account_analytics_select_own"
  on public.account_analytics
  for select
  using (
    exists (
      select 1
      from public.social_accounts
      where public.social_accounts.id = public.account_analytics.social_account_id
        and public.social_accounts.user_id = auth.uid()
    )
  );

drop policy if exists "inbox_messages_manage_own" on public.inbox_messages;
create policy "inbox_messages_manage_own"
  on public.inbox_messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
