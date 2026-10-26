alter table public.projects
  add column if not exists features text[] not null default '{}',
  add column if not exists process_steps text[] not null default '{}';

comment on column public.projects.features is 'Owner-editable case study feature list.';
comment on column public.projects.process_steps is 'Owner-editable case study flow, one step per item.';
