import { User, Calendar, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OwnerData {
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  user_type: string;
  created_at: string;
}

interface OwnerBasicInfoProps {
  ownerData: OwnerData;
  joinDate: string;
}

const OwnerBasicInfo = ({ ownerData, joinDate }: OwnerBasicInfoProps) => {
  const { t, i18n } = useTranslation();
  const formatJoinDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    // Format accordingly for Arabic
    if (i18n.language === "ar") {
      return dateObj.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
      });
    }
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
        {ownerData.avatar_url ? (
          <img
            src={ownerData.avatar_url}
            alt="Owner avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <User className="w-8 h-8 text-primary" />
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-semibold">
          {ownerData.full_name || t("auth.carOwner")}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{t("common.memberSince", { date: formatJoinDate(joinDate) })}</span>
        </div>

        {ownerData.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{ownerData.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBasicInfo;
