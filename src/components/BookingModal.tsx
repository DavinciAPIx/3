
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import BookingForm from "./BookingForm";
import BookingConfirmation from "./BookingConfirmation";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: {
    id: number;
    name: string;
    price: string;
    ownerId: string;
  };
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  onContactOwner: () => void;
}

type BookingFormData = {
  name: string;
  mobile: string;
  email: string;
  messageToOwner?: string;
};

const BookingModal = ({ 
  isOpen, 
  onClose, 
  car, 
  startDate, 
  endDate, 
  totalPrice,
  onContactOwner 
}: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [bookingId, setBookingId] = useState<string>("");

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      console.log('Submitting booking:', {
        car_id: car.id,
        renter_id: user.id,
        owner_id: car.ownerId,
        ...formData,
        pickup_date: startDate.toISOString().split('T')[0],
        return_date: endDate.toISOString().split('T')[0],
        total_amount: totalPrice,
      });

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          car_id: car.id,
          renter_id: user.id,
          owner_id: car.ownerId,
          renter_name: formData.name,
          renter_mobile: formData.mobile,
          renter_email: formData.email,
          message_to_owner: formData.messageToOwner || null,
          pickup_date: startDate.toISOString().split('T')[0],
          return_date: endDate.toISOString().split('T')[0],
          total_amount: totalPrice,
        })
        .select()
        .single();

      if (error) {
        console.error('Booking creation error:', error);
        throw error;
      }

      console.log('Booking created successfully:', data);
      setBookingId(data.id);
      setStep('confirmation');
      
      toast({
        title: "Booking Request Sent!",
        description: "The car owner will review your request and respond soon.",
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBrowseSimilar = () => {
    onClose();
    navigate('/');
  };

  const handleContactOwner = () => {
    onClose();
    onContactOwner();
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const handleClose = () => {
    setStep('form');
    setBookingId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <BookingForm
            car={car}
            startDate={startDate}
            endDate={endDate}
            totalPrice={totalPrice}
            onSubmit={handleBookingSubmit}
            onCancel={handleClose}
          />
        ) : (
          <BookingConfirmation
            booking={{
              id: bookingId,
              carName: car.name,
              pickupDate: startDate.toLocaleDateString(),
              returnDate: endDate.toLocaleDateString(),
              totalAmount: totalPrice,
            }}
            onBrowseSimilar={handleBrowseSimilar}
            onContactOwner={handleContactOwner}
            onGoHome={handleGoHome}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
