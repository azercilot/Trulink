-- Create table for signature tokens (for secure email links)
CREATE TABLE public.signature_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  party_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  otp_code TEXT,
  otp_verified BOOLEAN DEFAULT false,
  otp_sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for contract signatures
CREATE TABLE public.contract_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  signer_email TEXT NOT NULL,
  signer_name TEXT,
  signature_data TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  otp_verified BOOLEAN DEFAULT false,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add document_hash column to contracts for cryptographic locking
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS document_hash TEXT;

-- Enable RLS
ALTER TABLE public.signature_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Policies for signature_tokens (public access for verification via token)
CREATE POLICY "Anyone can read signature tokens by token" 
ON public.signature_tokens 
FOR SELECT 
USING (true);

CREATE POLICY "Contract owners can create signature tokens" 
ON public.signature_tokens 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM contracts 
  WHERE contracts.id = signature_tokens.contract_id 
  AND contracts.user_id = auth.uid()
));

CREATE POLICY "Allow token updates for OTP verification" 
ON public.signature_tokens 
FOR UPDATE 
USING (true);

-- Policies for contract_signatures
CREATE POLICY "Anyone can create signatures" 
ON public.contract_signatures 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Contract owners can view signatures" 
ON public.contract_signatures 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM contracts 
  WHERE contracts.id = contract_signatures.contract_id 
  AND contracts.user_id = auth.uid()
));