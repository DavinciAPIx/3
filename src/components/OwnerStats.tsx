import { Star, Car } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OwnerStatsProps {
  ownerStats: {
    totalCars: number;
    avgRating: number;
    totalReviews: number;
    joinDate: string;
  };
}

const OwnerStats = ({ ownerStats }: OwnerStatsProps) => {
  const { t } = useTranslation();
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          ({ownerStats.avgRating})
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("cars.rating")}</span>
        <div className="flex items-center gap-2">
          {ownerStats.avgRating > 0 ? (
            renderStars(ownerStats.avgRating)
          ) : (
            <span className="text-sm text-muted-foreground">{t("profile.noRatingsYet") || "No ratings yet"}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("common.reviews")}</span>
        <span className="font-semibold">{ownerStats.totalReviews}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("common.activeCars")}</span>
        <div className="flex items-center gap-1">
          <Car className="w-4 h-4" />
          <span className="font-semibold">{ownerStats.totalCars}</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerStats;
