
-- Create enum for document types
CREATE TYPE public.document_type AS ENUM ('national_id', 'iqama', 'drivers_license', 'passport');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create table for user document uploads
CREATE TABLE public.user_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  document_url TEXT NOT NULL,
  full_name TEXT NOT NULL,
  document_number TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND role = 'admin'
  )
$$;

-- RLS policies for user_documents
CREATE POLICY "Users can view their own documents" 
  ON public.user_documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
  ON public.user_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending documents" 
  ON public.user_documents 
  FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all documents" 
  ON public.user_documents 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all documents" 
  ON public.user_documents 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX idx_user_documents_status ON public.user_documents(status);
CREATE INDEX idx_user_documents_created_at ON public.user_documents(created_at);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
