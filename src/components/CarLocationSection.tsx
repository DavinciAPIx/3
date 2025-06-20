
import Map from "@/components/Map";

interface CarLocationSectionProps {
  location: string;
}

const CarLocationSection = ({ location }: CarLocationSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Location</h3>
      <Map location={location} />
    </div>
  );
};

export default CarLocationSection;
