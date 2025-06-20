
-- Add foreign key constraint to link car_comments.user_id to profiles.id
ALTER TABLE public.car_comments 
ADD CONSTRAINT car_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
