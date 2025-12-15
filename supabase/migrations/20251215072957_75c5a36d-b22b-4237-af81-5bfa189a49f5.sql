-- 1) Create new contract_parties table to store third-party personal data separately
CREATE TABLE public.contract_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  party_name text,
  party_email text,
  party_phone text,
  party_national_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_parties ENABLE ROW LEVEL SECURITY;

-- Only allow contract owners to see and manage parties
CREATE POLICY "Users can view parties of their contracts"
  ON public.contract_parties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_parties.contract_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert parties for their contracts"
  ON public.contract_parties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_parties.contract_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update parties of their contracts"
  ON public.contract_parties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_parties.contract_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete parties of their contracts"
  ON public.contract_parties
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_parties.contract_id
        AND c.user_id = auth.uid()
    )
  );

-- 2) Migrate existing party_* data from contracts into contract_parties
INSERT INTO public.contract_parties (contract_id, party_name, party_email, party_phone, party_national_id)
SELECT id, party_name, party_email, party_phone, party_national_id
FROM public.contracts
WHERE party_name IS NOT NULL
   OR party_email IS NOT NULL
   OR party_phone IS NOT NULL
   OR party_national_id IS NOT NULL;

-- 3) Drop sensitive columns from contracts table
ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS party_name,
  DROP COLUMN IF EXISTS party_email,
  DROP COLUMN IF EXISTS party_phone,
  DROP COLUMN IF EXISTS party_national_id;