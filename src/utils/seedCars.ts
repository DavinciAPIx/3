
import { supabase } from '@/integrations/supabase/client';

export const seedFeaturedCars = async () => {
  // Get the current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Authentication error:', authError);
    return { success: false, error: 'User must be authenticated to seed cars' };
  }

  const featuredCars = [
    {
      title: "Toyota Land Cruiser",
      description: "Reliable and spacious SUV perfect for family trips and desert adventures",
      price_per_day: 300,
      location: "Riyadh",
      image_url: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=500&q=80",
      is_available: true,
      owner_id: user.id // Use actual authenticated user ID
    },
    {
      title: "BMW 5 Series",
      description: "Luxury sedan with premium features and excellent performance",
      price_per_day: 450,
      location: "Jeddah",
      image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=500&q=80",
      is_available: true,
      owner_id: user.id
    },
    {
      title: "Chevrolet Tahoe",
      description: "Full-size SUV with ample space and powerful engine",
      price_per_day: 400,
      location: "Khobar",
      image_url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=500&q=80",
      is_available: true,
      owner_id: user.id
    },
    {
      title: "Mercedes-Benz E-Class",
      description: "Premium executive sedan with advanced technology and comfort",
      price_per_day: 550,
      location: "Riyadh",
      image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=500&q=80",
      is_available: true,
      owner_id: user.id
    },
    {
      title: "Kia Rio",
      description: "Compact and economical car perfect for city driving",
      price_per_day: 150,
      location: "Jeddah",
      image_url: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=500&q=80",
      is_available: true,
      owner_id: user.id
    },
    {
      title: "Porsche 911",
      description: "High-performance sports car for the ultimate driving experience",
      price_per_day: 960,
      location: "Riyadh",
      image_url: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?auto=format&fit=crop&w=500&q=80",
      is_available: true,
      owner_id: user.id
    }
  ];

  try {
    // Check if cars already exist
    const { data: existingCars } = await supabase
      .from('cars')
      .select('title')
      .in('title', featuredCars.map(car => car.title));

    // Only insert cars that don't already exist
    const carsToInsert = featuredCars.filter(car => 
      !existingCars?.some(existing => existing.title === car.title)
    );

    if (carsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('cars')
        .insert(carsToInsert)
        .select();

      if (error) {
        console.error('Error seeding cars:', error);
        return { success: false, error };
      }

      console.log('Successfully seeded cars:', data);
      return { success: true, data };
    } else {
      console.log('Cars already exist in database');
      return { success: true, message: 'Cars already exist' };
    }
  } catch (error) {
    console.error('Error in seedFeaturedCars:', error);
    return { success: false, error };
  }
};
