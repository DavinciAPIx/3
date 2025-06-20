
import { MapPin, Users, Fuel, Calendar } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/utils/i18n-utils';

interface CarDetailsInfoProps {
  selectedCar: {
    name: string;
    location: string;
    seats: number;
    fuel: string;
    description?: string;
    year?: number;
    transmission?: string;
    mileage?: string;
  };
}

const CarDetailsInfo = ({ selectedCar }: CarDetailsInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t("cars.aboutThisCar")}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {selectedCar.description || t("cars.defaultDescription")}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">{t("cars.carDetails")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm md:text-base">{selectedCar.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {selectedCar.seats} {t("cars.seatsUnit")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{selectedCar.fuel}</span>
          </div>
          {selectedCar.year && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{selectedCar.year}</span>
            </div>
          )}
        </div>
      </div>

      {(selectedCar.transmission || selectedCar.mileage) && (
        <div>
          <h3 className="text-xl font-semibold mb-3">{t("cars.specifications")}</h3>
          <div className="grid grid-cols-2 gap-4">
            {selectedCar.transmission && (
              <div>
                <span className="text-sm font-medium">{t("cars.transmission")}</span>
                <p className="text-sm text-muted-foreground">{selectedCar.transmission}</p>
              </div>
            )}
            {selectedCar.mileage && (
              <div>
                <span className="text-sm font-medium">{t("cars.mileage")}</span>
                <p className="text-sm text-muted-foreground">{selectedCar.mileage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetailsInfo;
