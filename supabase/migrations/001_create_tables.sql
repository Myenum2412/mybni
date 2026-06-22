-- BNI Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cbwnhqboezngcagiiutg/sql/new

-- 1. Users table (for auth profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  chapter_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Chapters table
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

-- 3. TYFCBs table
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

-- 4. Referrals table
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

-- 5. One & Ones table
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tyfcbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_and_ones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all access on chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow all access on tyfcbs" ON public.tyfcbs;
DROP POLICY IF EXISTS "Allow all access on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all access on one_and_ones" ON public.one_and_ones;

-- Create policies
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow all access on chapters" ON public.chapters FOR ALL USING (true);
CREATE POLICY "Allow all access on tyfcbs" ON public.tyfcbs FOR ALL USING (true);
CREATE POLICY "Allow all access on referrals" ON public.referrals FOR ALL USING (true);
CREATE POLICY "Allow all access on one_and_ones" ON public.one_and_ones FOR ALL USING (true);
