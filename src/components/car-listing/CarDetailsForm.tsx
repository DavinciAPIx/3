
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Car } from "lucide-react";
import DOMPurify from 'dompurify';

interface CarDetailsFormProps {
  formData: {
    make: string;
    model: string;
    year: string;
    type: string;
    seats: string;
    transmission: string;
    fuel: string;
    description: string;
  };
  setFormData: (data: any) => void;
}

const CarDetailsForm = ({ formData, setFormData }: CarDetailsFormProps) => {
  const sanitizeInput = (value: string) => {
   
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Car Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            placeholder="Toyota, BMW, Mercedes..."
            value={formData.make}
            onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            placeholder="Camry, X5, E-Class..."
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            placeholder="2023"
            min="2000"
            max="2024"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            required
          >
            <option value="">Select type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Compact">Compact</option>
            <option value="Sports">Sports</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seats">Seats *</Label>
          <Input
            id="seats"
            type="number"
            placeholder="5"
            min="2"
            max="8"
            value={formData.seats}
            onChange={(e) => setFormData(prev => ({ ...prev, seats: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission *</Label>
          <select
            id="transmission"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.transmission}
            onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
            required
          >
            <option value="">Select transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuel">Fuel Type *</Label>
          <select
            id="fuel"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.fuel}
            onChange={(e) => setFormData(prev => ({ ...prev, fuel: e.target.value }))}
            required
          >
            <option value="">Select fuel type</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your car, its condition, and any special features..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default CarDetailsForm;
