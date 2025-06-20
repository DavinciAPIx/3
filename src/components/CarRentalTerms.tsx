
import { Clock, Badge, Shield, Fuel } from "lucide-react";
import { useTranslation } from "react-i18next";

const CarRentalTerms = () => {
  const { t } = useTranslation();
  const terms = [
    {
      icon: Clock,
      title: t("rentalTerms.arriveOnTimeTitle"),
      description: t("rentalTerms.arriveOnTimeDesc")
    },
    {
      icon: Badge,
      title: t("rentalTerms.licenseTitle"),
      description: t("rentalTerms.licenseDesc")
    },
    {
      icon: Shield,
      title: t("rentalTerms.keepCleanTitle"),
      description: t("rentalTerms.keepCleanDesc")
    },
    {
      icon: Clock,
      title: t("rentalTerms.perDayTitle"),
      description: t("rentalTerms.perDayDesc")
    },
    {
      icon: Fuel,
      title: t("rentalTerms.refuelTitle"),
      description: t("rentalTerms.refuelDesc")
    }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{t("rentalTerms.rentalTerms")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {terms.map((term, index) => {
          const IconComponent = term.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <IconComponent className="w-6 h-6 text-primary mt-1" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{term.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{term.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CarRentalTerms;
