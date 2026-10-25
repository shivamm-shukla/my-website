create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), platform text not null check (platform in ('linkedin','twitter')),
  url text not null, embed_html text, caption text, pinned boolean not null default false,
  published boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, excerpt text not null default '',
  cover_url text, tags text[] not null default '{}', content_md text not null default '', published boolean not null default false,
  published_at timestamptz, reading_time integer not null default 1 check (reading_time > 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, summary text not null default '', category text not null,
  cover_url text, headline text, status text, treatment text not null default 'care', problem text not null default '', built text not null default '', tech text[] not null default '{}',
  result text not null default '', links jsonb not null default '{}', "order" integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, message text not null, created_at timestamptz not null default now()
);
create table if not exists public.rate_limits (
  key text primary key, count integer not null default 1, window_start timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.blogs enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.rate_limits enable row level security;

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts for select using (published = true);
drop policy if exists "published blogs are public" on public.blogs;
create policy "published blogs are public" on public.blogs for select using (published = true and published_at <= now());
drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public" on public.projects for select using (published = true);

insert into storage.buckets (id, name, public) values ('site-media','site-media',true) on conflict (id) do nothing;
drop policy if exists "site media public read" on storage.objects;
create policy "site media public read" on storage.objects for select using (bucket_id = 'site-media');

create index if not exists posts_publish_order on public.posts (published, pinned desc, created_at desc);
create index if not exists blogs_publish_order on public.blogs (published, published_at desc);
create index if not exists projects_publish_order on public.projects (published, "order");

insert into public.projects (slug,title,summary,category,headline,status,treatment,problem,built,result,links,"order",published) values
('thravia','Thravia','A trusted companion for your loved one’s hospital visit. Even when you’re far away.','Product','A little company. A lot of peace of mind.','Currently building','care','Families cannot always travel with a loved one for a hospital visit. Distance can turn an already difficult day into a lonely one.','Thravia lets a family book a trusted companion who can be there for the hospital visit and support their loved one in person.','Thravia is currently being built. Real usage and outcome details will be added only after they are ready to publish.','{"primary":"https://thravia.app","label":"Visit Thravia"}',1,true),
('brg-cli','brg-cli','Switch between AI coding tools. Bring your project context with you.','Developer tools','Different tools. Same context.','On npm','terminal','Moving between AI coding CLIs usually means rebuilding the same project context for each tool.','A git-style command-line tool that switches between Claude Code and Codex while carrying project context along.','The package is published on npm as brg-cli. Usage numbers and technical details are waiting for owner confirmation.','{"primary":"https://www.npmjs.com/package/brg-cli","label":"View on npm"}',2,true),
('jeetlo','Jeetlo','AI-powered exam prep for Hindi-medium students preparing for JNVST and CHS.','Education','Big dreams. Apni language mein.','Android app','learning','Hindi-medium students from rural areas need exam preparation that feels clear, familiar, and made for their context.','An AI-powered Android app for students preparing for JNVST and CHS in Hindi.','Jeetlo exists as an Android app. Screenshots, technology choices, links, and measured outcomes still need owner confirmation.','{}',3,true)
on conflict (slug) do nothing;
