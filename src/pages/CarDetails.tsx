
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ChatWindow from "@/components/ChatWindow";
import { debugCarPhotos } from "@/utils/debugCarPhotos";
import CarDetailsLayout from "@/components/car-details/CarDetailsLayout";
import CarDetailsContent from "@/components/car-details/CarDetailsContent";
import CarDetailsSidebar from "@/components/car-details/CarDetailsSidebar";
import { useCarData, transformCarData } from "@/hooks/useCarData";
import { useCarPhotos, processCarPhotos } from "@/hooks/useCarPhotos";
import { useOwnerProfile } from "@/hooks/useOwnerProfile";
import { useCarChat } from "@/hooks/useCarChat";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ownerName, setOwnerName] = useState<string>("");

  // Debug car photos when component mounts
  useEffect(() => {
    if (id) {
      const carId = parseInt(id);
      debugCarPhotos(carId);
    }
  }, [id]);

  // Fetch car details from database
  const { data: carData, isLoading, error } = useCarData(id);

  // Transform database car to match expected format
  const selectedCar = transformCarData(carData);

  // Fetch car photos
  const { data: carPhotosData, isLoading: photosLoading } = useCarPhotos(id);

  // Fetch owner profile information
  const { data: ownerProfile } = useOwnerProfile(selectedCar?.ownerId);

  // Chat functionality
  const { chatOpen, setChatOpen, conversationId, startChat } = useCarChat(selectedCar);

  // Update owner name when profile is loaded
  useEffect(() => {
    if (ownerProfile?.full_name) {
      setOwnerName(ownerProfile.full_name);
    } else if (selectedCar?.owner) {
      setOwnerName(selectedCar.owner);
    } else {
      setOwnerName("Car Owner");
    }
  }, [ownerProfile, selectedCar]);

  // Process photos for display
  const displayPhotos = processCarPhotos(carPhotosData, selectedCar, id);

  if (isLoading) {
    return (
      <CarDetailsLayout selectedCar={selectedCar}>
        <div className="text-center py-8">Loading car details...</div>
      </CarDetailsLayout>
    );
  }

  if (error || !selectedCar) {
    return (
      <CarDetailsLayout selectedCar={selectedCar}>
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Car not found</p>
          <p className="text-sm text-muted-foreground mt-2">The car you're looking for doesn't exist or has been removed.</p>
        </div>
      </CarDetailsLayout>
    );
  }

  return (
    <CarDetailsLayout selectedCar={selectedCar}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CarDetailsContent 
          selectedCar={selectedCar}
          displayPhotos={displayPhotos}
          photosLoading={photosLoading}
        />

        <CarDetailsSidebar 
          selectedCar={selectedCar}
          onContactOwner={startChat}
        />
      </div>

      {chatOpen && conversationId && user && (
        <ChatWindow
          conversationId={conversationId}
          ownerName={ownerName}
          carTitle={selectedCar.name}
          onClose={() => setChatOpen(false)}
          currentUserId={user.id}
        />
      )}
    </CarDetailsLayout>
  );
};

export default CarDetails;
