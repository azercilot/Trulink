-- Add DELETE policy for contract_templates so users can delete their own templates
CREATE POLICY "Users can delete their own templates"
  ON public.contract_templates
  FOR DELETE
  USING (auth.uid() = created_by);