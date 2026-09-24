-- Aroike / The Visionary Frame — contact inbox
--
-- Paste this entire script into the Supabase SQL Editor (SQL Editor → New query → Run)
-- on the new project whose URL and anon/publishable key are already in the site .env.
--
-- After this runs, with the env keys already added:
--   • The public contact form can INSERT using the anon key (no login).
--   • /admin can list, edit, and delete after Email/password sign-in.
--
-- Dashboard setup (not SQL):
--   1. Authentication → Providers → enable Email.
--   2. Authentication → Users → Add user (email + password). That account is the /admin login.
--   3. Run this script.
--   4. Restart or hard-refresh the site so Vite picks up the env keys.
--
-- Do not put the service_role key in the website. The browser client uses only
-- VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY. RLS below enforces access.
--
-- Inserts from the public form should use .insert(...) without .select().
-- anon is intentionally denied SELECT, so a returning select would fail.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  inquiry_type text not null,
  message text not null,
  social_handle text,
  preferred_contact text,
  brand_name text,
  website text,
  budget_range text,
  campaign_goal text,
  timeline text,
  status text not null default 'new',
  constraint contact_messages_status_check
    check (status in ('new', 'read', 'replied', 'archived'))
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

comment on table public.contact_messages is
  'Public contact-form submissions. Listed and edited at /admin.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row
  execute function public.set_updated_at();

alter table public.contact_messages enable row level security;
alter table public.contact_messages force row level security;

revoke all on table public.contact_messages from public, anon, authenticated;

grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

drop policy if exists contact_messages_insert_public on public.contact_messages;
drop policy if exists contact_messages_select_authenticated on public.contact_messages;
drop policy if exists contact_messages_update_authenticated on public.contact_messages;
drop policy if exists contact_messages_delete_authenticated on public.contact_messages;

-- Public contact form (anon key) and signed-in admin can create rows.
create policy contact_messages_insert_public
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- /admin inbox: any signed-in user can read every submission.
-- anon has no SELECT policy and no SELECT grant — cannot list or read others' messages.
create policy contact_messages_select_authenticated
  on public.contact_messages
  for select
  to authenticated
  using (true);

-- UPDATE also needs the SELECT policy above (Postgres RLS).
create policy contact_messages_update_authenticated
  on public.contact_messages
  for update
  to authenticated
  using (true)
  with check (true);

create policy contact_messages_delete_authenticated
  on public.contact_messages
  for delete
  to authenticated
  using (true);
