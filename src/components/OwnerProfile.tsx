import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import OwnerBasicInfo from "@/components/OwnerBasicInfo";
import OwnerStats from "@/components/OwnerStats";
import { useOwnerProfile } from "@/hooks/useOwnerProfile";
import { useTranslation } from "react-i18next";

interface OwnerProfileProps {
  ownerId: string;
  onContactClick: () => void;
}

interface OwnerStats {
  totalCars: number;
  avgRating: number;
  totalReviews: number;
  joinDate: string;
}

const OwnerProfile = ({ ownerId, onContactClick }: OwnerProfileProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [ownerStats, setOwnerStats] = useState<OwnerStats>({
    totalCars: 0,
    avgRating: 0,
    totalReviews: 0,
    joinDate: "",
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const { toast } = useToast();

  // Use the hook to fetch owner profile
  const { data: ownerData, isLoading: profileLoading } = useOwnerProfile(ownerId);

  useEffect(() => {
    if (ownerId) {
      fetchOwnerStats();
    }
  }, [ownerId]);

  const fetchOwnerStats = async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching owner stats for ID:', ownerId);
      
      // Fetch owner's cars count (including both available and unavailable)
      const { data: ownerCars, error: carsError } = await supabase
        .from("cars")
        .select("id")
        .eq("owner_id", ownerId);

      if (carsError) {
        console.error('Cars error:', carsError);
      }

      const carIds = ownerCars?.map(car => car.id) || [];
      const totalCars = carIds.length;
      console.log('Owner car IDs:', carIds, 'Total cars:', totalCars);

      // Fetch all comments for these cars to calculate ratings
      let commentsData = [];
      if (carIds.length > 0) {
        const { data: comments, error: commentsError } = await supabase
          .from("car_comments")
          .select("rating, content")
          .in("car_id", carIds);

        if (commentsError) {
          console.error('Comments error:', commentsError);
        } else {
          commentsData = comments || [];
        }
      }

      console.log('Comments data for owner:', commentsData);

      // Calculate stats from comments
      const totalReviews = commentsData.length;
      const ratingsWithValues = commentsData.filter(comment => comment.rating !== null && comment.rating > 0);
      const avgRating = ratingsWithValues.length > 0 
        ? ratingsWithValues.reduce((sum, comment) => sum + (comment.rating || 0), 0) / ratingsWithValues.length 
        : 0;

      console.log('Calculated stats:', { totalCars, totalReviews, avgRating, ratingsCount: ratingsWithValues.length });

      setOwnerStats({
        totalCars: totalCars,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: totalReviews,
        joinDate: ownerData?.created_at || new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error fetching owner stats:", error);
      // Set default stats on error
      setOwnerStats({
        totalCars: 0,
        avgRating: 0,
        totalReviews: 0,
        joinDate: new Date().toISOString(),
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleContactClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the owner.",
        variant: "destructive",
      });
      return;
    }
    onContactClick();
  };

  if (profileLoading || statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("common.ownerInformation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {t("common.loading")}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Always show the card with available data
  const displayOwnerData = ownerData || {
    id: ownerId,
    full_name: "Car Owner",
    avatar_url: null,
    phone: null,
    user_type: "car_owner",
    created_at: new Date().toISOString(),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.ownerInformation")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Basic Info */}
        <OwnerBasicInfo ownerData={displayOwnerData} joinDate={ownerStats.joinDate} />

        {/* Owner Stats */}
        <OwnerStats ownerStats={ownerStats} />

        {/* Contact Button */}
        <Button 
          onClick={handleContactClick}
          className="w-full mt-4"
          variant="outline"
        >
          {t("common.contactOwner")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OwnerProfile;
