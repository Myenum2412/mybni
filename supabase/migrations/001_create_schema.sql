-- BNI Database Schema (Consolidated)
-- Run this single file in Supabase SQL Editor: https://supabase.com/dashboard/project/cbwnhqboezngcagiiutg/sql/new
--
-- Roles:
--   org     = global access across all chapters (chapter_id = null)
--   dc      = chapter-scoped access (chapter_id = set)
--   member  = attendance only (chapter_id = set)

-- ──────────────────────────────────────────────
-- 1. Users table (profile + role)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'dc'
             CHECK (role IN ('org', 'dc', 'member')),
  chapter_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_chapter_id ON public.users(chapter_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ──────────────────────────────────────────────
-- 2. Chapters table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chapters (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         TEXT NOT NULL,
  region       TEXT NOT NULL DEFAULT '',
  meeting_day  TEXT NOT NULL DEFAULT '',
  meeting_time TEXT NOT NULL DEFAULT '',
  location     TEXT NOT NULL DEFAULT '',
  president    TEXT NOT NULL DEFAULT '',
  members      INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 3. TYFCBs table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tyfcbs (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id    BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name     TEXT NOT NULL DEFAULT '',
  thank_you_to  TEXT NOT NULL DEFAULT '',
  amount        TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  referral_type TEXT NOT NULL DEFAULT '',
  comments      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tyfcbs_chapter_id ON public.tyfcbs(chapter_id);
CREATE INDEX IF NOT EXISTS idx_tyfcbs_user_id ON public.tyfcbs(user_id);

-- ──────────────────────────────────────────────
-- 4. Referrals table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id      BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name       TEXT NOT NULL DEFAULT '',
  referred_to     TEXT NOT NULL DEFAULT '',
  referral_type   TEXT NOT NULL DEFAULT '',
  referral_status TEXT NOT NULL DEFAULT 'Pending',
  referral        TEXT NOT NULL DEFAULT '',
  telephone       TEXT,
  email           TEXT,
  address         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_chapter_id ON public.referrals(chapter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);

-- ──────────────────────────────────────────────
-- 5. One & Ones table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.one_and_ones (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id              BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id                 UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name               TEXT NOT NULL DEFAULT '',
  met_with                TEXT NOT NULL DEFAULT '',
  initiated_by            TEXT NOT NULL DEFAULT '',
  where_did_you_meet      TEXT NOT NULL DEFAULT '',
  date                    TEXT NOT NULL DEFAULT '',
  topics_of_conversation  TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_one_and_ones_chapter_id ON public.one_and_ones(chapter_id);
CREATE INDEX IF NOT EXISTS idx_one_and_ones_user_id ON public.one_and_ones(user_id);

-- ──────────────────────────────────────────────
-- 6. Attendance table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id  BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL DEFAULT '',
  date        DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, member_name, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_chapter_id ON public.attendance(chapter_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- ──────────────────────────────────────────────
-- 7. Enable RLS
-- ──────────────────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tyfcbs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_and_ones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance      ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 8. Drop existing policies (idempotent)
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own profile"       ON public.users;
DROP POLICY IF EXISTS "Users can update own profile"     ON public.users;
DROP POLICY IF EXISTS "Allow all access on chapters"     ON public.chapters;
DROP POLICY IF EXISTS "Allow all access on tyfcbs"       ON public.tyfcbs;
DROP POLICY IF EXISTS "Allow all access on referrals"     ON public.referrals;
DROP POLICY IF EXISTS "Allow all access on one_and_ones" ON public.one_and_ones;
DROP POLICY IF EXISTS "Allow all access on attendance"   ON public.attendance;

-- ──────────────────────────────────────────────
-- 9. Create policies
-- ──────────────────────────────────────────────
CREATE POLICY "Allow all access on users"          ON public.users        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on chapters"       ON public.chapters      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on tyfcbs"         ON public.tyfcbs        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on referrals"       ON public.referrals     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on one_and_ones"   ON public.one_and_ones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on attendance"     ON public.attendance   FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────
-- 10. Migrate existing data (if upgrading)
-- ──────────────────────────────────────────────
-- Convert old 'admin' roles to 'org'
UPDATE public.users SET role = 'org' WHERE role = 'admin';

-- Add user_id columns if upgrading from old schema (idempotent)
ALTER TABLE public.tyfcbs       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.referrals     ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.one_and_ones ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.attendance   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────
-- 11. Create first org user (optional seed)
-- Replace <YOUR_UUID> with an actual auth.users.id
-- ──────────────────────────────────────────────
-- INSERT INTO public.users (id, email, name, role, chapter_id)
-- VALUES ('<YOUR_UUID>', 'admin@bni.com', 'Super Admin', 'org', NULL);

-- ──────────────────────────────────────────────
-- Verify:
--   SELECT role, COUNT(*) FROM public.users GROUP BY role;
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
