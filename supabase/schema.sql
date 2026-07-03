-- =====================================================================
-- CAMPUS APP — PRODUCTION SCHEMA (v1)
-- Run this in Supabase SQL Editor
-- Tables: profiles, prompts, messages
-- =====================================================================

-- ---------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_net";     -- lets Postgres call the
                                              -- Google-Sheets sync Edge
                                              -- Function asynchronously

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
create type gender_type as enum ('male', 'female', 'other');

create type university_type as enum (
  'University of Jordan',
  'PSUT',
  'GJU',
  'JUST',
  'Yarmouk University',
  'Al-Ahliyya Amman University',
  'Other'
);

-- ---------------------------------------------------------------------
-- TABLE: profiles
-- One row per auth.users entry. This is the "app brain" record that
-- also drives onboarding UI (gender -> theme, university -> feed).
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null check (char_length(username) between 3 and 20),
  full_name       text,
  gender          gender_type,
  university      university_type,
  major           text,
  bio             text check (char_length(bio) <= 280),
  avatar_url      text,
  instagram_handle text,

  -- Monetization / future-proofing
  is_premium      boolean not null default false,
  premium_since   timestamptz,

  -- Visibility controls (needed for the Discovery Grid)
  is_public       boolean not null default true,
  is_onboarded    boolean not null default false,

  -- Lightweight engagement counters (denormalized for fast feed sorts)
  prompt_count    integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.profiles.is_premium is
  'Gates advanced features: hint reveals, full message history, etc.';

create index idx_profiles_university on public.profiles (university);
create index idx_profiles_is_public  on public.profiles (is_public);

-- ---------------------------------------------------------------------
-- TABLE: prompts
-- Anonymous questions sent to a profile ("NGL/Sarahah"-style core loop)
-- ---------------------------------------------------------------------
create table public.prompts (
  id               uuid primary key default gen_random_uuid(),
  recipient_id     uuid not null references public.profiles(id) on delete cascade,

  -- sender_id is nullable: prompts can be fully anonymous.
  -- If set, it's only visible to recipient if they are premium
  -- (drives the "unlock sender" paywall hook).
  sender_id        uuid references public.profiles(id) on delete set null,

  content          text not null check (char_length(content) between 1 and 500),

  -- Optional breadcrumb hints left by sender (free users see hint_1 only)
  hint_1           text,
  hint_2           text,

  answer_content   text,
  is_answered      boolean not null default false,
  is_public_answer boolean not null default true,

  created_at       timestamptz not null default now(),
  answered_at      timestamptz
);

create index idx_prompts_recipient on public.prompts (recipient_id, created_at desc);

-- ---------------------------------------------------------------------
-- TABLE: messages
-- 1:1 direct messages, e.g. after a prompt exchange leads to a chat.
-- ---------------------------------------------------------------------
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 1000),
  read_at      timestamptz,
  created_at   timestamptz not null default now(),

  constraint no_self_message check (sender_id <> receiver_id)
);

create index idx_messages_thread on public.messages (
  least(sender_id, receiver_id), greatest(sender_id, receiver_id), created_at
);

-- =====================================================================
-- updated_at AUTO-TOUCH TRIGGER
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- =====================================================================
-- GOOGLE SHEETS MIRROR HOOK (stub)
-- Fires on insert/update of profiles and calls a Supabase Edge Function
-- (`sync-to-sheets`) asynchronously via pg_net. The Edge Function holds
-- the Google service-account credentials — NEVER put them in Postgres.
-- =====================================================================
create or replace function public.notify_profile_sync()
returns trigger language plpgsql as $$
begin
  perform net.http_post(
    url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/sync-to-sheets',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object(
                 'id', new.id,
                 'username', new.username,
                 'university', new.university,
                 'gender', new.gender,
                 'is_premium', new.is_premium,
                 'event', TG_OP
               )
  );
  return new;
end;
$$;

create trigger trg_profiles_sync_sheets
after insert or update on public.profiles
for each row execute function public.notify_profile_sync();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.prompts  enable row level security;
alter table public.messages enable row level security;

-- profiles: public discovery feed can read public profiles;
-- users always manage their own row.
create policy "public profiles are viewable"
  on public.profiles for select
  using (is_public = true or auth.uid() = id);

create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- prompts: recipient can read everything sent to them;
-- anyone authenticated can send a prompt to a public profile.
create policy "recipient reads own prompts"
  on public.prompts for select
  using (auth.uid() = recipient_id);

create policy "authenticated users send prompts"
  on public.prompts for insert
  with check (auth.role() = 'authenticated');

create policy "recipient updates own prompts"
  on public.prompts for update
  using (auth.uid() = recipient_id);

-- messages: only sender/receiver can read or write their thread.
create policy "participants read messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "sender inserts message"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "receiver marks read"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- =====================================================================
-- SEED DATA — 10 hyper-local Jordanian university prompts
-- (Used to populate the Discovery Grid teaser cards. In production
-- these attach to real seeded demo profiles; UUIDs below are placeholders
-- — replace with real profile ids after your first test signups, or
-- wrap this block in a DO block that looks up usernames dynamically.)
-- =====================================================================
insert into public.prompts (recipient_id, content, hint_1, is_answered)
select p.id, q.content, q.hint_1, false
from public.profiles p
join (
  values
    ('Is it true you pulled an all-nighter in the UJ library before the Calc II final? 👀', 'Third floor, near the printers'),
    ('Who''s your crush from the Business building at PSUT? Be honest 😏', 'You share a Marketing 201 section'),
    ('GJU cafeteria or Health Club — where do you actually go between classes?', 'Someone saw you there Tuesday'),
    ('Rumor has it you topped the Software Eng midterm at JUST. True or nah?', 'Dr. Rania''s section'),
    ('If you could switch majors tomorrow with zero consequences, what would you pick?', null),
    ('Which UJ terrace café has the best knafeh — be loyal 🍯', 'Hint: it''s near Gate 4'),
    ('Someone from your Circuits II lab at PSUT has a huge crush on you 👀', 'You sit two rows apart'),
    ('What''s the wildest thing that happened during exam week at GJU dorms?', null),
    ('Be honest — did you actually finish the JUST group project or did your teammates carry you? 😅', 'You know who you are'),
    ('If Amman had one more metro stop just for your campus, where would it be?', null)
) as q(content, hint_1) on true
where p.username = '__DEMO_SEED_PLACEHOLDER__'   -- swap with real seed usernames
limit 0;  -- disabled by default — see note below

-- NOTE: The insert above is intentionally a no-op (limit 0) because prompts
-- require a real recipient_id from auth.users. Once you have at least one
-- test account, either:
--   1) delete "limit 0" and set the username filter to your seeded demo
--      accounts, or
--   2) run the 10 VALUES rows through your own seed script after signup.
