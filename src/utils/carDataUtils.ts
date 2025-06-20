export interface CarData {
  id: number;
  title: string;
  image_url?: string;
  price_per_day?: number;
  location?: string;
  description?: string;
  owner_id?: string;
}

export interface TransformedCarData {
  id: number;
  name: string;
  img: string;
  price: string;
  location: string;
  rating: number;
  seats: number;
  type: string;
  year: number;
  fuel: string;
  transmission: string;
  description: string;
  features: string[];
  owner: string;
  ownerId: string | undefined;
  ownerRating: number;
  totalTrips: number;
}

export const transformCarData = (carData: CarData): TransformedCarData => {
  return {
    id: carData.id,
    name: carData.title,
    img: carData.image_url || "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    price: (carData.price_per_day || 0).toString(),
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
  };
};