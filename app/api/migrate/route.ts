import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SQL = `-- BNI Database Schema (Consolidated)
-- Roles: org (global), dc (chapter-scoped), member (attendance-only)

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'dc' CHECK (role IN ('org', 'dc', 'member')),
  chapter_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_chapter_id ON public.users(chapter_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE TABLE IF NOT EXISTS public.chapters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  meeting_day TEXT NOT NULL DEFAULT '',
  meeting_time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  president TEXT NOT NULL DEFAULT '',
  members INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tyfcbs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  thank_you_to TEXT NOT NULL DEFAULT '',
  amount TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  referral_type TEXT NOT NULL DEFAULT '',
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tyfcbs_chapter_id ON public.tyfcbs(chapter_id);
CREATE INDEX IF NOT EXISTS idx_tyfcbs_user_id ON public.tyfcbs(user_id);

CREATE TABLE IF NOT EXISTS public.referrals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  referred_to TEXT NOT NULL DEFAULT '',
  referral_type TEXT NOT NULL DEFAULT '',
  referral_status TEXT NOT NULL DEFAULT 'Pending',
  referral TEXT NOT NULL DEFAULT '',
  telephone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referrals_chapter_id ON public.referrals(chapter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);

CREATE TABLE IF NOT EXISTS public.one_and_ones (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  met_with TEXT NOT NULL DEFAULT '',
  initiated_by TEXT NOT NULL DEFAULT '',
  where_did_you_meet TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  topics_of_conversation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_one_and_ones_chapter_id ON public.one_and_ones(chapter_id);
CREATE INDEX IF NOT EXISTS idx_one_and_ones_user_id ON public.one_and_ones(user_id);

CREATE TABLE IF NOT EXISTS public.attendance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, member_name, date)
);
CREATE INDEX IF NOT EXISTS idx_attendance_chapter_id ON public.attendance(chapter_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tyfcbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_and_ones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all access on chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow all access on tyfcbs" ON public.tyfcbs;
DROP POLICY IF EXISTS "Allow all access on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all access on one_and_ones" ON public.one_and_ones;
DROP POLICY IF EXISTS "Allow all access on attendance" ON public.attendance;

CREATE POLICY "Allow all access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on tyfcbs" ON public.tyfcbs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on referrals" ON public.referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on one_and_ones" ON public.one_and_ones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- Migrate old admin roles to org
UPDATE public.users SET role = 'org' WHERE role = 'admin';

-- Upgrade: add user_id if missing (idempotent)
ALTER TABLE public.tyfcbs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.one_and_ones ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
`

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase env vars" },
        { status: 500 }
      )
    }
    const supabase = createClient(url, key)

    const { error } = await supabase.rpc("exec_sql", { query: SQL })

    if (error) {
      const statements = SQL.split(";").filter((s) => s.trim())
      for (const stmt of statements) {
        const { error: stmtError } = await supabase.rpc("exec_sql", {
          query: stmt.trim() + ";",
        })
        if (stmtError) {
          console.warn("Statement failed:", stmtError.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed. Check Supabase dashboard for results.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: "Migration failed. Run SQL manually in Supabase dashboard.",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send POST to execute migration.",
  })
}
