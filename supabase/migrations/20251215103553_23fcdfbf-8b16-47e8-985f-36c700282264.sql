-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can read signature tokens by token" ON public.signature_tokens;

-- Create a more restrictive policy - only contract owners can view their tokens
CREATE POLICY "Contract owners can view their signature tokens" 
ON public.signature_tokens 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM contracts 
    WHERE contracts.id = signature_tokens.contract_id 
    AND contracts.user_id = auth.uid()
  )
);