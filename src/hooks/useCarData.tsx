
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformCarData, CarData } from "@/utils/carDataUtils";

// Mock car data as fallback
const mockCarFallback = {
  id: 1,
  name: "Toyota Land Cruiser",
  img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
  price: "300",
  location: "Riyadh",
  rating: 4.9,
  seats: 7,
  type: "SUV",
  year: 2022,
  fuel: "Gasoline",
  transmission: "Automatic",
  description: "Perfect for family trips and desert adventures. This spacious Land Cruiser offers comfort and reliability for your Saudi Arabia journey.",
  features: ["Air Conditioning", "GPS Navigation", "Bluetooth", "Backup Camera", "Leather Seats"],
  owner: "Ahmed Al-Rashid",
  ownerId: "owner-123",
  ownerRating: 4.8,
  totalTrips: 150
};

export const useCarData = (id: string | undefined) => {
  return useQuery({
    queryKey: ['carDetails', id],
    queryFn: async (): Promise<TransformedCarData> => {
      if (!id) throw new Error('No car ID provided');
      
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', parseInt(id))
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Car not found');
        
        return transformCarData(data as CarData);
      } catch (error) {
        console.error('Error fetching car:', error);
        return mockCarFallback;
      }
    },
    enabled: !!id,
  });
};

export const transformCarData = (carData: any) => {
  return carData ? {
    id: carData.id,
    name: carData.title,
    img: carData.image_url || "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    price: carData.price_per_day?.toString() || "0",
    location: carData.location || "Saudi Arabia",
    rating: 4.5 + Math.random() * 0.5,
    seats: 5,
    type: "Car",
    year: 2022,
    fuel: "Gasoline",
    transmission: "Automatic",
    description: carData.description || "A great car for your journey in Saudi Arabia.",
    features: ["Air Conditioning", "GPS Navigation", "Bluetooth", "Backup Camera"],
    owner: "Car Owner",
    ownerId: carData.owner_id,
    ownerRating: 4.8,
    totalTrips: Math.floor(Math.random() * 200) + 50
  } : mockCarFallback;
};
