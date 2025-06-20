
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, MessageCircle } from "lucide-react";

interface BookingConfirmationProps {
  booking: {
    id: string;
    carName: string;
    pickupDate: string;
    returnDate: string;
    totalAmount: number;
  };
  onBrowseSimilar: () => void;
  onContactOwner: () => void;
  onGoHome: () => void;
}

const BookingConfirmation = ({ 
  booking, 
  onBrowseSimilar, 
  onContactOwner, 
  onGoHome 
}: BookingConfirmationProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl text-green-600">
          Booking Request Sent Successfully!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Details */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Booking Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Car:</span>
              <span className="font-medium">{booking.carName}</span>
            </div>
            <div className="flex justify-between">
              <span>Pickup Date:</span>
              <span>{booking.pickupDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Return Date:</span>
              <span>{booking.returnDate}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total Amount:</span>
              <span>SAR {booking.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">What happens next?</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• The car owner will review your booking request</li>
            <li>• You'll receive a notification when they respond</li>
            <li>• Owner typically responds within 2 hours</li>
            <li>• If confirmed, you'll get contact details for pickup arrangement</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onContactOwner}
            className="w-full"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Owner Directly
          </Button>
          
          <Button
            onClick={onBrowseSimilar}
            className="w-full"
            variant="outline"
          >
            Browse Similar Vehicles
          </Button>
          
          <Button
            onClick={onGoHome}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        {/* Booking Reference */}
        <div className="text-center text-sm text-muted-foreground">
          Booking Reference: {booking.id.slice(0, 8).toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingConfirmation;
