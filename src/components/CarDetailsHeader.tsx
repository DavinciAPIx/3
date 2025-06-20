
import { useNavigate, useLocation } from "react-router-dom";
import { Star, MapPin, Users, Fuel } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CarDetailsHeaderProps {
  selectedCar: {
    name: string;
    ownerRating: number;
    location: string;
    seats: number;
    fuel: string;
  };
}

const CarDetailsHeader = ({ selectedCar }: CarDetailsHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleBackClick = () => {
    // Check if we came from another page on our site
    if (location.state?.from || document.referrer.includes(window.location.origin)) {
      navigate(-1);
    } else {
      // If we came directly or from external site, go to home
      navigate('/');
    }
  };

  return (
    <>
      <button 
        onClick={handleBackClick}
        className="mb-6 text-primary hover:underline flex items-center gap-2"
      >
        ← {t("navbar.backToSearch", "Back to search")}
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{selectedCar.name}</h1>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{selectedCar.ownerRating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{selectedCar.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{selectedCar.seats} {t("cars.seatsUnit")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4" />
          <span>{selectedCar.fuel}</span>
        </div>
      </div>
    </>
  );
};

export default CarDetailsHeader;
