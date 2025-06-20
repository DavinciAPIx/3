
-- Add approval status to cars table
ALTER TABLE public.cars 
ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add admin notes for approval/rejection reasons
ALTER TABLE public.cars 
ADD COLUMN admin_notes text;

-- Add approved_by and approved_at fields for tracking
ALTER TABLE public.cars 
ADD COLUMN approved_by uuid REFERENCES auth.users(id);

ALTER TABLE public.cars 
ADD COLUMN approved_at timestamp with time zone;

-- Update existing cars to be approved by default
UPDATE public.cars SET approval_status = 'approved' WHERE approval_status IS NULL;
