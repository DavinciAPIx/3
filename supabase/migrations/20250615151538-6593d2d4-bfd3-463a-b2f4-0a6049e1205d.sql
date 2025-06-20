
-- Create RPC function to get car photos and avoid TypeScript issues
CREATE OR REPLACE FUNCTION public.get_car_photos(car_id_param integer)
RETURNS TABLE (
  photo_url text,
  display_order integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.photo_url,
    cp.display_order
  FROM public.car_photos cp
  WHERE cp.car_id = car_id_param
  ORDER BY cp.display_order ASC;
END;
$$;
