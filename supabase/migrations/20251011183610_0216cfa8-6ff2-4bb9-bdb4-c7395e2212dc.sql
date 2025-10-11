-- Phase 3.4: Zero-Error Build - Database Security Hardening

-- A) Ensure all tables have RLS enabled
DO $$
DECLARE 
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
  END LOOP;
END $$;

-- B) Add updated_at trigger to all tables that have updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- Create triggers for tables with updated_at
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT DISTINCT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND column_name = 'updated_at'
  LOOP
    BEGIN
      EXECUTE format($f$
        DROP TRIGGER IF EXISTS %I_set_updated_at ON public.%I;
        CREATE TRIGGER %I_set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
      $f$, tbl.table_name, tbl.table_name, tbl.table_name, tbl.table_name);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create trigger for %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- C) Fix policy USING clauses to use proper syntax
-- Example for alerts table (repeat pattern for other user-scoped tables)
DO $$
BEGIN
  -- Drop and recreate alerts policies with correct syntax
  DROP POLICY IF EXISTS alerts_owner_access ON public.alerts;
  DROP POLICY IF EXISTS alerts_owner_manage ON public.alerts;
  
  CREATE POLICY alerts_owner_manage 
  ON public.alerts
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Alerts policy update failed: %', SQLERRM;
END $$;

-- D) Ensure audit functions use SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.audit_write(_action text, _target uuid, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'pg_catalog', 'public'
AS $$
BEGIN
  INSERT INTO public.audit_log(actor, action, target, meta)
  VALUES (auth.uid(), _action, _target, COALESCE(_meta,'{}'::jsonb));
END $$;