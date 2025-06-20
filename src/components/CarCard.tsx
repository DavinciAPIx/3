
import { Star, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface CarCardProps {
  car: {
    id: number;
    name: string;
    img: string;
    price: string;
    location: string;
    rating: number;
    seats: number;
    type: string;
  };
}

const CarCard = memo(({ car }: CarCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewDetails = () => {
    navigate(`/car/${car.id}`);
  };

  return (
    <div className="modern-card h-full flex flex-col group hover-lift">
      <div className="relative overflow-hidden rounded-t-xl">
        <img 
          src={car.img} 
          alt={car.name} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute top-3 left-3 bg-foreground/90 text-background text-xs px-3 py-1.5 rounded-lg font-semibold backdrop-blur-sm">
          {car.type}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 glass text-foreground px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg backdrop-blur-sm">
          <Star size={16} className="text-yellow-400" fill="#facc15" /> 
          {car.rating}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {car.name}
          </h3>
          <div className="bg-muted text-foreground rounded-lg px-3 py-1.5 font-bold text-base shadow-sm border whitespace-nowrap">
            {t("common.currency")} {car.price}/{t("cars.perDay")}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
          <MapPin size={16} className="text-foreground flex-shrink-0" />
          <span className="truncate">{car.location}</span>
          <Users size={16} className="ml-4 flex-shrink-0" />
          <span className="whitespace-nowrap">{car.seats} {t("cars.seats")}</span>
        </div>
        <button
          className="bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg py-3 mt-auto transition btn-modern focus:outline-none focus:ring-2 focus:ring-foreground/20"
          onClick={handleViewDetails}
          type="button"
        >
          {t("cars.viewDetails")}
        </button>
      </div>
    </div>
  );
});

CarCard.displayName = "CarCard";

export default CarCard;
