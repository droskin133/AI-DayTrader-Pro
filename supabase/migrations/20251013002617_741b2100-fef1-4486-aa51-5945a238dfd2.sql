-- AI DayTrader Pro v3.7 Clean Production Build
-- Purpose: Complete schema with RLS, triggers, and realtime

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
DO $$ BEGIN 
  CREATE TYPE market_source AS ENUM ('finnhub','polygon','quiver','sec','newsapi'); 
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

DO $$ BEGIN 
  CREATE TYPE alert_status AS ENUM ('active','triggered','disabled'); 
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- Users table (minimal profile)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, symbol)
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id bigserial PRIMARY KEY,
  symbol text,
  headline text NOT NULL,
  source text NOT NULL,
  url text NOT NULL,
  published_at timestamptz NOT NULL,
  inserted_at timestamptz DEFAULT now()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  symbol text PRIMARY KEY,
  price numeric NOT NULL,
  open numeric,
  high numeric,
  low numeric,
  prev_close numeric,
  updated_at timestamptz DEFAULT now()
);

-- AI learning log table
CREATE TABLE IF NOT EXISTS ai_learning_log (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  condition text NOT NULL,
  status alert_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  triggered_at timestamptz
);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id bigserial PRIMARY KEY,
  function text NOT NULL,
  message text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  action text NOT NULL,
  record_id text,
  changed_at timestamptz DEFAULT now(),
  user_id uuid DEFAULT auth.uid()
);

-- Security helper functions
CREATE OR REPLACE FUNCTION is_authenticated() 
RETURNS boolean 
LANGUAGE sql 
SECURITY INVOKER 
AS $$ 
  SELECT auth.uid() IS NOT NULL; 
$$;

CREATE OR REPLACE FUNCTION is_service_role() 
RETURNS boolean 
LANGUAGE sql 
SECURITY INVOKER 
AS $$ 
  SELECT coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'; 
$$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can only access own record
DROP POLICY IF EXISTS users_self_access ON users;
CREATE POLICY users_self_access ON users 
FOR ALL 
USING (auth.uid() = id);

-- Watchlist: owner access only
DROP POLICY IF EXISTS watchlist_owner_access ON watchlist;
CREATE POLICY watchlist_owner_access ON watchlist 
FOR ALL 
USING (auth.uid() = user_id);

-- News: public read
DROP POLICY IF EXISTS news_read ON news;
CREATE POLICY news_read ON news 
FOR SELECT 
USING (true);

-- Quotes: public read
DROP POLICY IF EXISTS quotes_read ON quotes;
CREATE POLICY quotes_read ON quotes 
FOR SELECT 
USING (true);

-- AI learning log: insert for authenticated, read own
DROP POLICY IF EXISTS ai_log_insert ON ai_learning_log;
CREATE POLICY ai_log_insert ON ai_learning_log 
FOR INSERT 
WITH CHECK (is_authenticated());

DROP POLICY IF EXISTS ai_log_read ON ai_learning_log;
CREATE POLICY ai_log_read ON ai_learning_log 
FOR SELECT 
USING (auth.uid() = user_id OR is_service_role());

-- Alerts: owner access
DROP POLICY IF EXISTS alerts_access ON alerts;
CREATE POLICY alerts_access ON alerts 
FOR ALL 
USING (auth.uid() = user_id);

-- Error logs: service role only
DROP POLICY IF EXISTS error_logs_service ON error_logs;
CREATE POLICY error_logs_service ON error_logs 
FOR ALL 
USING (is_service_role());

-- Audit log: read only for authenticated
DROP POLICY IF EXISTS audit_log_read ON audit_log;
CREATE POLICY audit_log_read ON audit_log 
FOR SELECT 
USING (is_authenticated());

-- Audit trigger function
CREATE OR REPLACE FUNCTION trg_audit_generic() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY INVOKER 
AS $$
BEGIN
  INSERT INTO audit_log (table_name, action, record_id) 
  VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.id::text, OLD.id::text));
  
  IF TG_OP IN ('INSERT','UPDATE') THEN 
    RETURN NEW; 
  ELSE 
    RETURN OLD; 
  END IF;
END; 
$$;

-- Apply audit trigger to watchlist
DROP TRIGGER IF EXISTS trg_watchlist_audit ON watchlist;
CREATE TRIGGER trg_watchlist_audit 
AFTER INSERT OR UPDATE OR DELETE ON watchlist 
FOR EACH ROW 
EXECUTE FUNCTION trg_audit_generic();

-- Set up realtime for key tables
ALTER TABLE watchlist REPLICA IDENTITY FULL;
ALTER TABLE news REPLICA IDENTITY FULL;
ALTER TABLE quotes REPLICA IDENTITY FULL;
ALTER TABLE ai_learning_log REPLICA IDENTITY FULL;
ALTER TABLE alerts REPLICA IDENTITY FULL;