-- Final security fixes - Part 3: Create missing watchlist table and enable remaining RLS

-- Step 7: Create the missing watchlist table that is referenced in policies
CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  ticker text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, ticker)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_user_own" ON public.watchlist
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 8: Check remaining tables that might need RLS
-- Enable RLS on announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_public_read" ON public.announcements
FOR SELECT USING (true);

CREATE POLICY "announcements_admin_manage" ON public.announcements
FOR ALL USING (public.get_current_user_role() IN ('admin', 'president'));

-- Enable RLS on vendor_keys table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_keys' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.vendor_keys ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "vendor_keys_admin_only" ON public.vendor_keys FOR ALL USING (public.get_current_user_role() IN (''admin'', ''president''))';
  END IF;
END $$;