-- Allow public read access to contracts when accessed via valid signature token
CREATE POLICY "Public can view contracts via signature token" 
ON public.contracts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM signature_tokens 
    WHERE signature_tokens.contract_id = contracts.id 
    AND signature_tokens.used_at IS NULL 
    AND signature_tokens.expires_at > now()
  )
);