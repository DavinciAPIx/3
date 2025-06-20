import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CarCard from "./CarCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

// Fallback cars data in case database is empty or there's an error
const fallbackCars = [
  {
    id: 1,
    name: "Toyota Land Cruiser",
    img: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=500&q=80",
    price: "300",
    location: "Riyadh",
    rating: 4.9,
    seats: 7,
    type: "SUV"
  },
  {
    id: 2,
    name: "BMW 5 Series",
    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=500&q=80",
    price: "450",
    location: "Jeddah",
    rating: 4.8,
    seats: 5,
    type: "Sedan"
  },
  {
    id: 3,
    name: "Chevrolet Tahoe",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=500&q=80",
    price: "400",
    location: "Khobar",
    rating: 4.7,
    seats: 7,
    type: "SUV"
  },
  {
    id: 4,
    name: "Mercedes-Benz E-Class",
    img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=500&q=80",
    price: "550",
    location: "Riyadh",
    rating: 4.95,
    seats: 5,
    type: "Sedan"
  },
  {
    id: 5,
    name: "Kia Rio",
    img: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=500&q=80",
    price: "150",
    location: "Jeddah",
    rating: 4.6,
    seats: 5,
    type: "Compact"
  },
  {
    id: 6,
    name: "Porsche 911",
    img: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?auto=format&fit=crop&w=500&q=80",
    price: "960",
    location: "Riyadh",
    rating: 4.98,
    seats: 2,
    type: "Sports"
  }
];

interface SearchResults {
  location: string;
  pickupDate: Date;
  returnDate: Date;
}

interface FeaturedCarsProps {
  searchResults?: SearchResults | null;
}

const FeaturedCars = ({ searchResults }: FeaturedCarsProps) => {
  const { t } = useTranslation();

  // Optimized query with better error handling and caching
  const { data: dbCars, isLoading, error } = useQuery({
    queryKey: ['featuredCars'],
    queryFn: async () => {
      console.log('Fetching featured cars from database...');
      const { data, error } = await supabase
        .from('cars')
        .select('id, title, image_url, price_per_day, location, approval_status, is_available')
        .eq('is_available', true)
        .eq('approval_status', 'approved')
        .limit(6)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching cars:', error);
        return null; // Return null instead of throwing to allow fallback
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once on failure
  });

  // Transform database cars to match the expected format with memoization
  const transformedDbCars = dbCars?.map(car => ({
    id: car.id,
    name: car.title,
    img: car.image_url || "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=500&q=80",
    price: car.price_per_day?.toString() || "0",
    location: car.location || "Saudi Arabia",
    rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
    seats: 5,
    type: "Car"
  }));

  // Use database cars if available and valid, otherwise use fallback
  let carsToShow = (transformedDbCars && transformedDbCars.length > 0) 
    ? transformedDbCars 
    : fallbackCars;

  // Filter cars based on search results
  if (searchResults) {
    console.log('Filtering cars based on search:', searchResults);
    carsToShow = carsToShow.filter(car => 
      car.location.toLowerCase().includes(searchResults.location.toLowerCase())
    );
  }

  // Improved loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="modern-card overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="cars" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {carsToShow.length > 0 ? (
        carsToShow.map((car) => (
          <CarCard key={car.id} car={car} />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-lg text-muted-foreground">
            {searchResults 
              ? t("cars.noResults", { location: searchResults.location })
              : t("cars.noAvailable")
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FeaturedCars;
