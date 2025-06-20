
-- First, ensure the profile exists for the admin user
INSERT INTO public.profiles (id, user_type, full_name)
SELECT id, 'car_owner'::user_type, email
FROM auth.users 
WHERE email = 'cherif111@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  user_type = 'car_owner'::user_type,
  full_name = COALESCE(excluded.full_name, profiles.full_name);

-- Ensure the admin role exists for the user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'cherif111@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
