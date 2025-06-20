
-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', true);

-- Create storage policies for user documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'user-documents' 
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admins can delete documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-documents' 
  AND public.is_admin(auth.uid())
);
