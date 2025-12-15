-- Add columns for AI analysis, version control, audit trail, and branding

-- Add AI analysis columns to contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS ai_risk_analysis jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_summary text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_contract_id uuid REFERENCES public.contracts(id);

-- Create audit_logs table for tracking all contract activities
CREATE TABLE IF NOT EXISTS public.contract_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT NULL,
  ip_address text DEFAULT NULL,
  user_agent text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.contract_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
CREATE POLICY "Users can view their contract audit logs"
  ON public.contract_audit_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = contract_audit_logs.contract_id AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can create audit logs for their contracts"
  ON public.contract_audit_logs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = contract_audit_logs.contract_id AND contracts.user_id = auth.uid()
  ));

-- Create KYC verification table
CREATE TABLE IF NOT EXISTS public.party_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  national_id text NOT NULL,
  birth_date date DEFAULT NULL,
  verification_status text NOT NULL DEFAULT 'pending',
  verification_result jsonb DEFAULT NULL,
  verified_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on party_verifications
ALTER TABLE public.party_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for party_verifications
CREATE POLICY "Users can view verifications for their contracts"
  ON public.party_verifications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = party_verifications.contract_id AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can create verifications for their contracts"
  ON public.party_verifications
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = party_verifications.contract_id AND contracts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update verifications for their contracts"
  ON public.party_verifications
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM contracts WHERE contracts.id = party_verifications.contract_id AND contracts.user_id = auth.uid()
  ));

-- Add file_label column to contract_files for document labeling
ALTER TABLE public.contract_files
ADD COLUMN IF NOT EXISTS file_label text DEFAULT NULL;

-- Create user_branding table for custom document styling
CREATE TABLE IF NOT EXISTS public.user_branding (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  logo_url text DEFAULT NULL,
  primary_color text DEFAULT '#00C853',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_branding
ALTER TABLE public.user_branding ENABLE ROW LEVEL SECURITY;

-- Policies for user_branding
CREATE POLICY "Users can view their own branding"
  ON public.user_branding
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own branding"
  ON public.user_branding
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding"
  ON public.user_branding
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on user_branding
CREATE TRIGGER update_user_branding_updated_at
  BEFORE UPDATE ON public.user_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add categories to contract_templates for advanced filtering
ALTER TABLE public.contract_templates
ADD COLUMN IF NOT EXISTS sub_category text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';