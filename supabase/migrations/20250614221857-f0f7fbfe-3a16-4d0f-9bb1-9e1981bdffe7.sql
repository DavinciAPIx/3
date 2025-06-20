
-- Add foreign key constraint between car_comments and cars tables
ALTER TABLE public.car_comments 
ADD CONSTRAINT car_comments_car_id_fkey 
FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;
