-- Add rate limiting columns to signature_tokens
ALTER TABLE public.signature_tokens 
ADD COLUMN IF NOT EXISTS otp_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS otp_locked_until timestamp with time zone;

-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Allow token updates for OTP verification" ON public.signature_tokens;

-- No public UPDATE policy needed - edge functions use service role which bypasses RLS