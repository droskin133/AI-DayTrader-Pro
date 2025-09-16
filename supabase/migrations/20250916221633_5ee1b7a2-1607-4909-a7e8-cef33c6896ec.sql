-- Fix RLS security issues: Enable RLS on missing tables and create policies

-- 1. Enable RLS on announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on watchlist_tags table  
ALTER TABLE public.watchlist_tags ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for announcements table
-- Allow all authenticated users to read announcements (they're meant to be public to users)
CREATE POLICY "Authenticated users can view announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (true);

-- Only admins/presidents can manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'president')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'president')
  )
);

-- 4. Create policies for watchlist_tags table
-- Users can only access their own watchlist tags
CREATE POLICY "Users can manage own watchlist tags"
ON public.watchlist_tags
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());