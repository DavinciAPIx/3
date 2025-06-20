
-- Create storage bucket for car photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-photos',
  'car-photos', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for car photos bucket
CREATE POLICY "Anyone can view car photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-photos');

CREATE POLICY "Authenticated users can upload car photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'car-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own car photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own car photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
