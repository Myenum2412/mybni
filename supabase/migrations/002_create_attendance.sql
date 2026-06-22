-- Attendance table for chapter meeting attendance tracking
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cbwnhqboezngcagiiutg/sql/new

CREATE TABLE IF NOT EXISTS public.attendance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, member_name, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on attendance" ON public.attendance;
CREATE POLICY "Allow all access on attendance" ON public.attendance FOR ALL USING (true);
