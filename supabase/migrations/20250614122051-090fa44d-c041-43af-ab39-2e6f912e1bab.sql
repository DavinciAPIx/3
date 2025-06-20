
-- Ensure the user_type enum exists
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('car_owner', 'car_renter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop and recreate the trigger function to handle potential errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles with error handling
  INSERT INTO public.profiles (id, user_type, full_name)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data ->> 'user_type')::user_type, 'car_renter'::user_type),
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
