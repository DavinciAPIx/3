
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CarFeaturesSelectorProps {
  selectedFeatures: string[];
  onFeatureChange: (feature: string, checked: boolean) => void;
}

const CarFeaturesSelector = ({ selectedFeatures, onFeatureChange }: CarFeaturesSelectorProps) => {
  const availableFeatures = [
    "Air Conditioning", "GPS Navigation", "Bluetooth", "Backup Camera", 
    "Leather Seats", "Sunroof", "Heated Seats", "USB Charging Ports"
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Features & Amenities</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {availableFeatures.map((feature) => (
          <div key={feature} className="flex items-center space-x-2">
            <Checkbox
              id={feature}
              aria-label={`Select ${feature}`}
              checked={selectedFeatures.includes(feature)}
              onCheckedChange={(checked) => onFeatureChange(feature, !!checked)}
            />
            <Label htmlFor={feature} className="text-sm md:text-base">
              {feature}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarFeaturesSelector;
