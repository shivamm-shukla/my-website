-- Additive reader interactions. Anonymous clients read approved comments only;
-- public submissions are written through rate-limited server actions.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  blog_slug text not null references public.blogs(slug) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent_text text not null,
  consented_at timestamptz not null default now(),
  source text not null default 'blog',
  status text not null default 'active' check (status in ('active','unsubscribed'))
);

alter table public.comments enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "approved blog comments are public" on public.comments;
create policy "approved blog comments are public" on public.comments for select using (
  status = 'approved' and exists (
    select 1 from public.blogs where blogs.slug = comments.blog_slug and blogs.published = true and blogs.published_at <= now()
  )
);

create index if not exists comments_blog_review on public.comments (blog_slug, status, created_at);
create index if not exists subscribers_status_order on public.subscribers (status, consented_at desc);
