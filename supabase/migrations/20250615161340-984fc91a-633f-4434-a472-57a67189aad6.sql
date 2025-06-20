
-- Ensure the car_photos table exists with proper structure
CREATE TABLE IF NOT EXISTS public.car_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id integer NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_car_photos_car_id ON public.car_photos(car_id);
CREATE INDEX IF NOT EXISTS idx_car_photos_display_order ON public.car_photos(car_id, display_order);

-- Enable RLS
ALTER TABLE public.car_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view car photos" ON public.car_photos
  FOR SELECT USING (true);

CREATE POLICY "Car owners can insert their car photos" ON public.car_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cars 
      WHERE cars.id = car_photos.car_id 
      AND cars.owner_id = auth.uid()
    )
  );

CREATE POLICY "Car owners can update their car photos" ON public.car_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cars 
      WHERE cars.id = car_photos.car_id 
      AND cars.owner_id = auth.uid()
    )
  );

CREATE POLICY "Car owners can delete their car photos" ON public.car_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.cars 
      WHERE cars.id = car_photos.car_id 
      AND cars.owner_id = auth.uid()
    )
  );
