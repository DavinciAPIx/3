
-- Add RLS policies for profiles table to allow admin access
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for cars table to allow admin access
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cars" 
  ON public.cars 
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own cars" 
  ON public.cars 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own cars" 
  ON public.cars 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own cars" 
  ON public.cars 
  FOR DELETE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all cars" 
  ON public.cars 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any car" 
  ON public.cars 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
