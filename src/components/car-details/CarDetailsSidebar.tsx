
import CarBookingCard from "@/components/CarBookingCard";
import OwnerProfile from "@/components/OwnerProfile";

interface CarDetailsSidebarProps {
  selectedCar: any;
  onContactOwner: () => void;
}

const CarDetailsSidebar = ({ selectedCar, onContactOwner }: CarDetailsSidebarProps) => {
  return (
    <div className="lg:col-span-1">
      <div className="space-y-6">
        {/* Booking Form */}
        <CarBookingCard selectedCar={selectedCar} onContactOwner={onContactOwner} />

        {/* Owner Profile */}
        <OwnerProfile 
          ownerId={selectedCar.ownerId} 
          onContactClick={onContactOwner}
        />
      </div>
    </div>
  );
};

export default CarDetailsSidebar;
