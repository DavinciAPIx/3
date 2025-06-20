
import { useState } from "react";
import { MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/DatePicker";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import BookingModal from "./BookingModal";
import { useTranslation } from "react-i18next";

interface CarBookingCardProps {
  selectedCar: {
    id: number;
    price: string;
    rating: number;
    name: string;
    ownerId: string;
  };
  onContactOwner: () => void;
}

const CarBookingCard = ({ selectedCar, onContactOwner }: CarBookingCardProps) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalPrice = calculateDays() * parseInt(selectedCar.price);

  const handleBooking = () => {
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("auth.login") || "Please log in to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: t("common.error"),
        description: t("cars.pickUpDate") + " & " + t("cars.returnDate"),
        variant: "destructive",
      });
      return;
    }
    
    setShowBookingModal(true);
  };

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {t("common.currency")} {selectedCar.price}/{t("cars.perDay")}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{selectedCar.rating.toFixed(1)}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("cars.pickUpDate")}</Label>
            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              placeholder={t("cars.selectPickupDate")}
              minDate={new Date()}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t("cars.returnDate")}</Label>
            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              placeholder={t("cars.selectReturnDate")}
              minDate={startDate || new Date()}
              disabled={!startDate}
            />
          </div>

          {calculateDays() > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>
                  {t("common.currency")} {selectedCar.price} x {calculateDays()} {t("cars.perDay")}
                </span>
                <span>
                  {t("common.currency")} {totalPrice}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>{t("common.success", { context: "total" }) || "Total"}</span>
                <span>
                  {t("common.currency")} {totalPrice}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBooking}
            className="w-full"
            size="lg"
          >
            {t("common.bookNow")}
          </Button>

          <Button 
            onClick={onContactOwner}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("common.contactOwner")}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {t("common.notChargedYet")}
          </div>
        </CardContent>
      </Card>

      {startDate && endDate && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          car={selectedCar}
          startDate={startDate}
          endDate={endDate}
          totalPrice={totalPrice}
          onContactOwner={onContactOwner}
        />
      )}
    </>
  );
};

export default CarBookingCard;
