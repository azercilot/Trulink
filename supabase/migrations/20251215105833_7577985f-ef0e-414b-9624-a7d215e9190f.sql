-- Add reminder_sent_at column to signature_tokens for tracking reminders
ALTER TABLE public.signature_tokens 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create a view to easily find contracts needing reminders
CREATE OR REPLACE VIEW public.pending_signatures_for_reminder AS
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

-- Grant access to the view
GRANT SELECT ON public.pending_signatures_for_reminder TO authenticated;