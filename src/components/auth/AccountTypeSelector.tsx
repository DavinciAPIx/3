
import { User, Car } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AccountTypeSelectorProps {
  userType: 'car_owner' | 'car_renter';
  setUserType: (type: 'car_owner' | 'car_renter') => void;
}

const AccountTypeSelector = ({ userType, setUserType }: AccountTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Account Type</Label>
      <div className="grid grid-cols-2 gap-4">
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            userType === 'car_renter' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => setUserType('car_renter')}
        >
          <div className="text-center">
            <User className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Car Renter</h3>
            <p className="text-sm text-muted-foreground">Rent cars from owners</p>
          </div>
        </div>
        
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            userType === 'car_owner' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => setUserType('car_owner')}
        >
          <div className="text-center">
            <Car className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Car Owner</h3>
            <p className="text-sm text-muted-foreground">List your cars for rent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
