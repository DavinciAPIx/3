
-- Create storage bucket for car photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-photos', 'car-photos', true);

-- Create storage policies for car photos
CREATE POLICY "Users can upload car photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'car-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view car photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'car-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own car photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'car-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view car photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'car-photos');
