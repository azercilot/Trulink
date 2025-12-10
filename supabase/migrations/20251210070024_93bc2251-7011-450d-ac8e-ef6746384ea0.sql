-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  national_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content JSONB,
  total_amount DECIMAL(15,2),
  currency TEXT DEFAULT 'تومان',
  party_name TEXT,
  party_email TEXT,
  party_phone TEXT,
  party_national_id TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_files table for attachments
CREATE TABLE public.contract_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_templates table
CREATE TABLE public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for contracts
CREATE POLICY "Users can view their own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
  ON public.contracts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for contract_files
CREATE POLICY "Users can view files of their contracts"
  ON public.contract_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_files.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their contracts"
  ON public.contract_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_files.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their contracts"
  ON public.contract_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_files.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for contract_templates
CREATE POLICY "Anyone can view public templates"
  ON public.contract_templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
  ON public.contract_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', false);

-- Storage policies
CREATE POLICY "Users can upload contract files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contract-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own contract files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contract-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own contract files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'contract-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert some default contract templates
INSERT INTO public.contract_templates (name, description, category, content, is_public)
VALUES 
  ('قرارداد خرید و فروش خودرو', 'قرارداد استاندارد برای خرید و فروش خودرو', 'خودرو', '{"sections": [{"title": "مشخصات خریدار"}, {"title": "مشخصات فروشنده"}, {"title": "مشخصات خودرو"}, {"title": "شرایط پرداخت"}]}', true),
  ('قرارداد اجاره ملک', 'قرارداد استاندارد اجاره مسکونی و تجاری', 'ملک', '{"sections": [{"title": "مشخصات موجر"}, {"title": "مشخصات مستاجر"}, {"title": "مشخصات ملک"}, {"title": "شرایط اجاره"}]}', true),
  ('قرارداد خرید و فروش ملک', 'قرارداد رسمی برای انتقال مالکیت ملک', 'ملک', '{"sections": [{"title": "مشخصات خریدار"}, {"title": "مشخصات فروشنده"}, {"title": "مشخصات ملک"}, {"title": "شرایط پرداخت"}]}', true),
  ('قرارداد همکاری', 'قرارداد همکاری بین شرکت‌ها یا افراد', 'تجاری', '{"sections": [{"title": "طرف اول"}, {"title": "طرف دوم"}, {"title": "موضوع همکاری"}, {"title": "شرایط همکاری"}]}', true),
  ('قرارداد استخدام', 'قرارداد کار و استخدام نیروی انسانی', 'منابع انسانی', '{"sections": [{"title": "مشخصات کارفرما"}, {"title": "مشخصات کارمند"}, {"title": "شرایط کار"}, {"title": "حقوق و مزایا"}]}', true);