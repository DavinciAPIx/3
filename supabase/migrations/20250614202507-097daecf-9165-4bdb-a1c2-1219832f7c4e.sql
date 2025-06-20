
-- Create a table for car comments
CREATE TABLE public.car_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.car_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for car comments
CREATE POLICY "Anyone can view car comments" 
  ON public.car_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.car_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.car_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.car_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for car_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.car_comments;
