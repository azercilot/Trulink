-- Drop the security definer view and recreate as a simple view
DROP VIEW IF EXISTS public.pending_signatures_for_reminder;

-- Recreate view without security definer (use service role in edge function instead)
CREATE VIEW public.pending_signatures_for_reminder 
WITH (security_invoker = true)
AS
SELECT 
  st.id as token_id,
  st.contract_id,
  st.party_email,
  st.token,
  st.expires_at,
  st.created_at as token_created_at,
  st.reminder_sent_at,
  c.title as contract_title,
  c.user_id as owner_id
FROM signature_tokens st
JOIN contracts c ON c.id = st.contract_id
WHERE st.used_at IS NULL 
  AND st.expires_at > now()
  AND (st.reminder_sent_at IS NULL OR st.reminder_sent_at < now() - interval '2 days');