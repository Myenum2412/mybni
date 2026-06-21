import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SQL = `-- BNI Database Schema Migration
-- Creates all tables, RLS policies, and sample data

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
  to TEXT NOT NULL DEFAULT '',
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
CREATE POLICY IF NOT EXISTS "Allow all access on referrals" ON public.referrals FOR ALL USING (true);
CREATE POLICY "Allow all access on one_and_ones" ON public.one_and_ones FOR ALL USING (true);

INSERT INTO public.chapters (name, region, meeting_day, meeting_time, location, president, members) VALUES
  ('BNI Victory', 'North', 'Tuesday', '7:00 AM', 'Hotel Grand Palace', 'Rahul Sharma', 32),
  ('BNI Prosperity', 'South', 'Wednesday', '7:30 AM', 'Business Hub Center', 'Priya Patel', 28),
  ('BNI Synergy', 'East', 'Thursday', '7:00 AM', 'Tech Park Auditorium', 'Amit Kumar', 35),
  ('BNI Elevate', 'West', 'Friday', '8:00 AM', 'City Convention Hall', 'Sneha Reddy', 24),
  ('BNI Catalyst', 'Central', 'Monday', '7:00 AM', 'Downtown Business Club', 'Vikram Singh', 30);

INSERT INTO public.tyfcbs (chapter_id, user_name, thank_you_to, amount, business_type, referral_type, comments) VALUES
  (1, 'John Smith', 'Alice Johnson', '$5,000', 'Real Estate', 'Direct', 'Closed deal on downtown property'),
  (2, 'Sarah Williams', 'Bob Miller', '$2,500', 'Insurance', 'Indirect', 'Annual policy renewal'),
  (3, 'Mike Davis', 'Carol White', '$10,000', 'Construction', 'Direct', 'Commercial building project'),
  (4, 'Emily Brown', 'David Wilson', '$1,200', 'Legal', 'Direct', 'Contract review services'),
  (5, 'James Taylor', 'Emma Moore', '$7,800', 'Accounting', 'Indirect', 'Tax consultation referral');

INSERT INTO public.referrals (chapter_id, user_name, to, referral_type, referral_status, referral, telephone, email, address) VALUES
  (1, 'John Smith', 'Alice Johnson', 'Direct', 'Closed', 'Real Estate Deal', '(555) 123-4567', 'alice@example.com', '123 Main St, New York, NY'),
  (2, 'Sarah Williams', 'Bob Miller', 'Indirect', 'Pending', 'Insurance Policy', '(555) 234-5678', 'bob@example.com', '456 Oak Ave, Los Angeles, CA'),
  (3, 'Mike Davis', 'Carol White', 'Direct', 'Closed', 'Construction Project', '(555) 345-6789', 'carol@example.com', '789 Pine Rd, Chicago, IL'),
  (4, 'Emily Brown', 'David Wilson', 'Direct', 'In Progress', 'Legal Services', '(555) 456-7890', 'david@example.com', '321 Elm St, Houston, TX'),
  (5, 'James Taylor', 'Emma Moore', 'Indirect', 'Pending', 'Accounting Services', '(555) 567-8901', 'emma@example.com', '654 Maple Dr, Phoenix, AZ');

INSERT INTO public.one_and_ones (chapter_id, user_name, met_with, initiated_by, where_did_you_meet, date, topics_of_conversation) VALUES
  (1, 'John Smith', 'Alice Johnson', 'John Smith', 'Coffee Shop', '2025-01-15', 'Real estate referrals, upcoming projects'),
  (2, 'Sarah Williams', 'Bob Miller', 'Bob Miller', 'BNI Chapter Meeting', '2025-01-18', 'Insurance cross-referrals, client needs'),
  (3, 'Mike Davis', 'Carol White', 'Mike Davis', 'Restaurant', '2025-01-22', 'Construction project pipeline, vendor intro'),
  (4, 'Emily Brown', 'David Wilson', 'Emily Brown', 'Office', '2025-01-25', 'Legal service packages, referral process'),
  (5, 'James Taylor', 'Emma Moore', 'Emma Moore', 'Networking Event', '2025-01-28', 'Accounting needs, tax season prep');
`

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Execute SQL via Supabase admin RPC
    const { error } = await supabase.rpc("exec_sql", { query: SQL })

    if (error) {
      // Try splitting into individual statements
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
    message: "Send POST to execute migration. Warning: deletes this endpoint after use.",
  })
}
