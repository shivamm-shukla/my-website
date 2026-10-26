create table if not exists public.site_settings (
  id text primary key check (id = 'default'),
  content jsonb not null default '{}'::jsonb,
  public_read boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "public site presentation settings" on public.site_settings;
create policy "public site presentation settings" on public.site_settings
  for select using (public_read = true);

comment on table public.site_settings is 'Public presentation settings edited through the owner-only Studio; writes use the server service role.';
