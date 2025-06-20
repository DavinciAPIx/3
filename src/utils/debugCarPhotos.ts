
import { supabase } from "@/integrations/supabase/client";

export const debugCarPhotos = async (carId: number) => {
  console.log('=== DEBUGGING CAR PHOTOS ===');
  console.log('Car ID:', carId);
  
  // Check if car exists
  const { data: carData, error: carError } = await supabase
    .from('cars')
    .select('id, title, image_url')
    .eq('id', carId)
    .single();
  
  if (carError) {
    console.error('Car not found:', carError);
    return;
  }
  
  console.log('Car found:', carData);
  
  // Check car_photos table
  const { data: photosData, error: photosError } = await supabase
    .from('car_photos')
    .select('*')
    .eq('car_id', carId);
  
  if (photosError) {
    console.error('Error fetching photos:', photosError);
    return;
  }
  
  console.log('Photos in database:', photosData);
  console.log('Number of photos:', photosData?.length || 0);
  
  // Check all photos in car_photos table
  const { data: allPhotos, error: allError } = await supabase
    .from('car_photos')
    .select('*');
  
  if (!allError) {
    console.log('All photos in car_photos table:', allPhotos);
  }
  
  console.log('=== END DEBUG ===');
};
