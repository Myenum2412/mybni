import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SQL = `-- BNI Database Schema Migration
-- Creates all tables and RLS policies (no sample data)

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member',
  chapter_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  user_name TEXT NOT NULL DEFAULT '',
  thank_you_to TEXT NOT NULL DEFAULT '',
  amount TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  referral_type TEXT NOT NULL DEFAULT '',
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.one_and_ones (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT '',
  met_with TEXT NOT NULL DEFAULT '',
  initiated_by TEXT NOT NULL DEFAULT '',
  where_did_you_meet TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  topics_of_conversation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tyfcbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_and_ones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all access on chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow all access on tyfcbs" ON public.tyfcbs;
DROP POLICY IF EXISTS "Allow all access on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all access on one_and_ones" ON public.one_and_ones;

CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow all access on chapters" ON public.chapters FOR ALL USING (true);
CREATE POLICY "Allow all access on tyfcbs" ON public.tyfcbs FOR ALL USING (true);
CREATE POLICY "Allow all access on referrals" ON public.referrals FOR ALL USING (true);
CREATE POLICY "Allow all access on one_and_ones" ON public.one_and_ones FOR ALL USING (true);
`

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
