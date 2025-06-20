
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCarPhotos = (id: string | undefined) => {
  return useQuery({
    queryKey: ['carPhotos', id],
    queryFn: async () => {
      if (!id) {
        console.log('No car ID provided for photos');
        return [];
      }
      
      const carId = parseInt(id);
      console.log('Fetching car photos for car ID:', carId);
      
      try {
        const { data: photosData, error: photosError } = await supabase
          .from('car_photos')
          .select('photo_url, display_order')
          .eq('car_id', carId)
          .order('display_order', { ascending: true });
        
        if (photosError) {
          console.error('Error fetching car photos:', photosError);
          return [];
        }
        
        console.log('Fetched photos from car_photos table:', photosData);
        return photosData || [];
      } catch (err) {
        console.error('Exception while fetching photos:', err);
        return [];
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const processCarPhotos = (carPhotosData: any[], selectedCar: any, id: string | undefined) => {
  let displayPhotos: string[] = [];
  
  console.log('=== PHOTO PROCESSING DEBUG ===');
  console.log('Car ID:', id);
  console.log('Raw carPhotosData:', carPhotosData);
  
  if (carPhotosData && Array.isArray(carPhotosData) && carPhotosData.length > 0) {
    console.log('Processing', carPhotosData.length, 'photos from database...');
    
    displayPhotos = carPhotosData
      .map((photo: any, index: number) => {
        console.log(`Photo ${index}:`, photo);
        return photo.photo_url;
      })
      .filter((url: string) => {
        const isValid = url && typeof url === 'string' && url.trim() !== '';
        console.log('URL valid:', isValid, 'URL:', url);
        return isValid;
      });
    
    console.log('Extracted valid photo URLs:', displayPhotos);
  } else {
    console.log('No database photos found, using fallbacks');
  }
  
  // Fallback logic
  if (displayPhotos.length === 0) {
    console.log('No database photos, checking selectedCar.img:', selectedCar.img);
    if (selectedCar.img) {
      displayPhotos = [selectedCar.img];
      console.log('Using car main image as fallback');
    } else {
      displayPhotos = [
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
      ];
      console.log('Using default placeholder images');
    }
  }

  console.log('=== FINAL PHOTO RESULT ===');
  console.log('Final displayPhotos:', displayPhotos);
  console.log('Photo count to display:', displayPhotos.length);
  console.log('================================');

  return displayPhotos;
};
