
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, DollarSign } from "lucide-react";

interface LocationPricingFormProps {
  formData: {
    location: string;
    price: string;
  };
  setFormData: (data: any) => void;
}

const LocationPricingForm = ({ formData, setFormData }: LocationPricingFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Location & Pricing</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">City *</Label>
          <select
            id="location"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          >
            <option value="">Select city</option>
            <option value="Riyadh">Riyadh</option>
            <option value="Jeddah">Jeddah</option>
            <option value="Mecca">Mecca</option>
            <option value="Medina">Medina</option>
            <option value="Dammam">Dammam</option>
            <option value="Khobar">Khobar</option>
            <option value="Dhahran">Dhahran</option>
            <option value="Jubail">Jubail</option>
            <option value="Taif">Taif</option>
            <option value="Tabuk">Tabuk</option>
            <option value="Buraidah">Buraidah</option>
            <option value="Khamis Mushait">Khamis Mushait</option>
            <option value="Hail">Hail</option>
            <option value="Hafr Al-Batin">Hafr Al-Batin</option>
            <option value="Abha">Abha</option>
            <option value="Yanbu">Yanbu</option>
            <option value="Al Mubarraz">Al Mubarraz</option>
            <option value="Najran">Najran</option>
            <option value="Al Qatif">Al Qatif</option>
            <option value="Sakaka">Sakaka</option>
            <option value="Jizan">Jizan</option>
            <option value="Unaizah">Unaizah</option>
            <option value="Arar">Arar</option>
            <option value="Al Bahah">Al Bahah</option>
            <option value="Al Qunfudhah">Al Qunfudhah</option>
            <option value="Ras Tanura">Ras Tanura</option>
            <option value="Thuwal">Thuwal</option>
            <option value="Bisha">Bisha</option>
            <option value="Al Dawadimi">Al Dawadimi</option>
            <option value="Qurayyat">Qurayyat</option>
            <option value="Al Aflaj">Al Aflaj</option>
            <option value="Wadi al-Dawasir">Wadi al-Dawasir</option>
            <option value="Ar Rass">Ar Rass</option>
            <option value="Rafha">Rafha</option>
            <option value="Turaif">Turaif</option>
            <option value="Al Zulfi">Al Zulfi</option>
            <option value="Sabya">Sabya</option>
            <option value="Al Majma'ah">Al Majma'ah</option>
            <option value="Shaqra">Shaqra</option>
            <option value="Al Kharj">Al Kharj</option>
            <option value="Hafar Al-Batin">Hafar Al-Batin</option>
            <option value="Samtah">Samtah</option>
            <option value="Abu Arish">Abu Arish</option>
            <option value="Tarout">Tarout</option>
            <option value="Safwa">Safwa</option>
            <option value="Saihat">Saihat</option>
            <option value="Qatif">Qatif</option>
            <option value="Rahima">Rahima</option>
            <option value="Al Wakrah">Al Wakrah</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Daily Rate (SAR) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="location"
              aria-label="Enter location"
              placeholder="e.g. Riyadh, Jeddah..."
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
            
            <Input
              id="price"
              aria-label="Enter price per day"
              type="number"
              placeholder="e.g. 150"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Recommended: SAR 120-400 per day
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPricingForm;
