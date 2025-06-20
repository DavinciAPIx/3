
import CarPhotoCarousel from "@/components/CarPhotoCarousel";
import CarDetailsInfo from "@/components/CarDetailsInfo";
import CarRentalTerms from "@/components/CarRentalTerms";
import CarLocationSection from "@/components/CarLocationSection";
import CarComments from "@/components/CarComments";

interface CarDetailsContentProps {
  selectedCar: any;
  displayPhotos: string[];
  photosLoading: boolean;
}

const CarDetailsContent = ({ selectedCar, displayPhotos, photosLoading }: CarDetailsContentProps) => {
  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        {/* Photo carousel */}
        <div>
          {photosLoading ? (
            <div className="w-full h-80 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Loading photos...</span>
            </div>
          ) : (
            <CarPhotoCarousel photos={displayPhotos} carName={selectedCar.name} />
          )}
        </div>
        
        <div>
          <CarDetailsInfo selectedCar={selectedCar} />
        </div>

        {/* Rental Terms Section */}
        <CarRentalTerms />

        {/* Map Section */}
        <CarLocationSection location={selectedCar.location} />

        {/* Comments Section */}
        <CarComments carId={selectedCar.id} carName={selectedCar.name} />
      </div>
    </div>
  );
};

export default CarDetailsContent;
