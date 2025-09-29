-- 1.7 RLS Enablement + Policies (strict, explicit)
-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sec_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insider_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_calendar ENABLE ROW LEVEL SECURITY;

-- Alerts (owner CRUD)
DROP POLICY IF EXISTS alerts_owner_read ON public.alerts;
CREATE POLICY alerts_owner_read ON public.alerts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS alerts_owner_write ON public.alerts;
CREATE POLICY alerts_owner_write ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS alerts_owner_update ON public.alerts;
CREATE POLICY alerts_owner_update ON public.alerts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS alerts_owner_delete ON public.alerts;
CREATE POLICY alerts_owner_delete ON public.alerts FOR DELETE USING (auth.uid() = user_id);

-- Watchlists (owner CRUD)
DROP POLICY IF EXISTS watchlists_owner_read ON public.watchlists;
CREATE POLICY watchlists_owner_read ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS watchlists_owner_write ON public.watchlists;
CREATE POLICY watchlists_owner_write ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS watchlists_owner_update ON public.watchlists;
CREATE POLICY watchlists_owner_update ON public.watchlists FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS watchlists_owner_delete ON public.watchlists;
CREATE POLICY watchlists_owner_delete ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- AI Learning Log (owner read/write; service_role insert)
DROP POLICY IF EXISTS ai_learning_log_owner_read ON public.ai_learning_log;
CREATE POLICY ai_learning_log_owner_read ON public.ai_learning_log FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS ai_learning_log_owner_write ON public.ai_learning_log;
CREATE POLICY ai_learning_log_owner_write ON public.ai_learning_log FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- AI Feedback (owner CRUD)
DROP POLICY IF EXISTS ai_feedback_owner_read ON public.ai_feedback;
CREATE POLICY ai_feedback_owner_read ON public.ai_feedback FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS ai_feedback_owner_write ON public.ai_feedback;
CREATE POLICY ai_feedback_owner_write ON public.ai_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS ai_feedback_owner_update ON public.ai_feedback;
CREATE POLICY ai_feedback_owner_update ON public.ai_feedback FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS ai_feedback_owner_delete ON public.ai_feedback;
CREATE POLICY ai_feedback_owner_delete ON public.ai_feedback FOR DELETE USING (auth.uid() = user_id);

-- user_plans (owner read; service write)
DROP POLICY IF EXISTS user_plans_owner_read ON public.user_plans;
CREATE POLICY user_plans_owner_read ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS user_plans_service_write ON public.user_plans;
CREATE POLICY user_plans_service_write ON public.user_plans
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Market reference tables (public read)
DROP POLICY IF EXISTS sec_filings_public_read ON public.sec_filings;
CREATE POLICY sec_filings_public_read ON public.sec_filings FOR SELECT USING (true);

DROP POLICY IF EXISTS insider_transactions_public_read ON public.insider_transactions;
CREATE POLICY insider_transactions_public_read ON public.insider_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS institutional_ownership_public_read ON public.institutional_ownership;
CREATE POLICY institutional_ownership_public_read ON public.institutional_ownership FOR SELECT USING (true);

DROP POLICY IF EXISTS analyst_targets_public_read ON public.analyst_targets;
CREATE POLICY analyst_targets_public_read ON public.analyst_targets FOR SELECT USING (true);

DROP POLICY IF EXISTS earnings_calendar_public_read ON public.earnings_calendar;
CREATE POLICY earnings_calendar_public_read ON public.earnings_calendar FOR SELECT USING (true);