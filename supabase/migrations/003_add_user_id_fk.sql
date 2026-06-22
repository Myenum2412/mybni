-- Add user_id foreign key to all data tables
-- Run this in Supabase SQL Editor

-- 1. Add user_id to tyfcbs
ALTER TABLE public.tyfcbs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. Add user_id to referrals
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Add user_id to one_and_ones
ALTER TABLE public.one_and_ones
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Add user_id to attendance
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Add name column to users table (if not exists)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS name TEXT;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tyfcbs_user_id ON public.tyfcbs(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_one_and_ones_user_id ON public.one_and_ones(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
