-- ============================================================
-- شجرتي بصمتي · SHAJARATI BASMATI — Supabase schema
-- تشغيل: Supabase Dashboard > SQL Editor > New query > الصق الكامل > Run
-- ============================================================

-- ------------------------------------------------------------
-- 1) أشجار — walked-in QR passport rows (id =matrix id, e.g. SKK-COL-043)
-- ------------------------------------------------------------
create table if not exists public.trees (
  id             text primary key,
  campaign_id    text,
  municipality_id text not null,
  species_ar     text not null,
  species_en     text not null,
  planted_at     date   not null,
  last_watered   date,
  row            integer not null default 1,
  col            integer not null default 1,
  status         text    not null default 'stable'
                 check (status in ('stable','monitoring','risk','critical')),
  health         integer not null default 100 check (health between 0 and 100),
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  notes_ar       text,
  notes_en       text,
  planted_by     text,
  art            integer not null default 0,
  waterings      integer not null default 0,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) الحملات
-- ------------------------------------------------------------
create table if not exists public.campaigns (
  id             text primary key,
  name_ar        text not null,
  name_en        text not null,
  municipality_id text not null,
  date           date not null,
  target         integer not null default 0,
  planted        integer not null default 0,
  layout         text not null default 'grid' check (layout in ('grid','rows')),
  spacing        numeric not null default 2.5,
  species_ar     text,
  species_en     text,
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  status         text not null default 'active' check (status in ('planned','active','completed')),
  created_at     date not null default current_date
);

-- ------------------------------------------------------------
-- 3) المجلة — منشورات
-- ------------------------------------------------------------
create table if not exists public.posts (
  id             text primary key,
  title_ar       text not null,
  title_en       text not null,
  excerpt_ar     text,
  excerpt_en     text,
  body_ar        text not null,
  body_en        text,
  category       text not null default 'news'
                 check (category in ('campaign','news','gallery','tip')),
  image_url      text,
  images         jsonb,
  author         text not null,
  author_id      text,
  municipality_id text,
  date           date not null default current_date,
  likes          integer not null default 0,
  art            integer not null default 0,
  featured       boolean not null default false,
  hidden         boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4) المستخدمون — RBAC (state_admin / municipality_admin / volunteer)
-- ------------------------------------------------------------
create table if not exists public.users (
  id             text primary key,
  first_name     text not null,
  last_name      text not null,
  email          text not null unique,
  password       text not null,          -- MVP؛ الترحيل إلى Supabase Auth خطوة لاحقة
  role           text not null default 'volunteer'
                 check (role in ('state_admin','municipality_admin','volunteer')),
  municipality_id text,
  health_limitations text,
  joined_at      date not null default current_date,
  avatar_color   text not null default '#16865B',
  trees_watered  integer not null default 0
);

-- ------------------------------------------------------------
-- 5) الأنشطة — سجل ميداني مشترك (سقايات، غرس، تصعيد…)
-- ------------------------------------------------------------
create table if not exists public.activities (
  id             text primary key,
  type           text not null check (type in ('water','plant','campaign','issue','role','join')),
  text_ar        text not null,
  text_en        text not null,
  at             timestamptz not null default now(),
  municipality_id text,
  actor          text,
  tree_id        text
);

-- ------------------------------------------------------------
-- فهرس للتحقق السريع من السجل حسب الشجرة (جواز السفر)
-- ------------------------------------------------------------
create index if not exists activities_tree_idx on public.activities (tree_id, at desc);

-- ============================================================
-- RLS — تفعيل سياسات الوصول
-- المرحلة الحالية: قارئ عام (anon) + كتابة مفتوحة لأن الجلسة
-- تعتمد مفتاحاً عاماً وحساباً محلياً؛ الصرامة الكاملة تأتي مع
-- Supabase Auth (خطوة لاحقة موثقة في README).
-- ============================================================
alter table public.trees      enable row level security;
alter table public.campaigns  enable row level security;
alter table public.posts      enable row level security;
alter table public.users      enable row level security;
alter table public.activities enable row level security;

create policy "trees_public_read"        on public.trees      for select using (true);
create policy "trees_public_write"       on public.trees      for all    using (true) with check (true);
create policy "campaigns_public_read"    on public.campaigns  for select using (true);
create policy "campaigns_public_write"   on public.campaigns  for all    using (true) with check (true);
create policy "posts_public_read"        on public.posts      for select using (true);
create policy "posts_public_write"       on public.posts      for all    using (true) with check (true);
create policy "users_public_read"        on public.users      for select using (true);
create policy "users_public_write"       on public.users      for all    using (true) with check (true);
create policy "activities_public_read"   on public.activities for select using (true);
create policy "activities_public_write"  on public.activities for all    using (true) with check (true);

-- ============================================================
-- Realtime broadcast for the `users` table.
-- Required so role promotions reach the volunteer's phone instantly
-- (the app listens on postgres_changes for `public.users`).
-- Guarded so re-running the schema never raises.
-- ============================================================
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'users'
  ) then
    alter publication supabase_realtime add table public.users;
  end if;
end
$$;
