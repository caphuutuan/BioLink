-- Run this in Supabase SQL Editor

create table if not exists public.app_profile (
  id integer primary key,
  avatar text not null,
  name text not null,
  description text not null,
  updated_at timestamptz not null default now(),
  constraint app_profile_singleton check (id = 1)
);

create table if not exists public.app_links (
  id text primary key,
  title text not null,
  description text,
  url text not null,
  icon text not null,
  type text not null check (type in ('button', 'card')),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.app_profile enable row level security;
alter table public.app_links enable row level security;

drop policy if exists "public read profile" on public.app_profile;
drop policy if exists "public write profile" on public.app_profile;
drop policy if exists "public read links" on public.app_links;
drop policy if exists "public write links" on public.app_links;

create policy "public read profile"
on public.app_profile for select
to anon
using (true);

create policy "public write profile"
on public.app_profile for all
to anon
using (true)
with check (true);

create policy "public read links"
on public.app_links for select
to anon
using (true);

create policy "public write links"
on public.app_links for all
to anon
using (true)
with check (true);

insert into public.app_profile (id, avatar, name, description)
values (1, 'https://picsum.photos/seed/bio/200/200', 'Hữu Tuấn AI', 'Quản lý link affiliate và mạng xã hội của bạn một cách chuyên nghiệp.')
on conflict (id) do nothing;
