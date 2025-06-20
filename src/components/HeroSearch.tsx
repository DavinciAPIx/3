
import { useState } from "react";
import { DatePicker } from "./DatePicker";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface SearchResults {
  location: string;
  pickupDate: Date;
  returnDate: Date;
}

interface HeroSearchProps {
  onSearch?: (results: SearchResults) => void;
}

const HeroSearch = ({ onSearch }: HeroSearchProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!location.trim()) {
      toast({
        title: t("hero.locationRequired"),
        description: t("hero.locationRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!pickupDate) {
      toast({
        title: t("hero.pickupDateRequired"),
        description: t("hero.pickupDateRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!returnDate) {
      toast({
        title: t("hero.returnDateRequired"),
        description: t("hero.returnDateRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    if (pickupDate >= returnDate) {
      toast({
        title: t("hero.invalidDateRange"),
        description: t("hero.invalidDateRangeDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Search data:", { location, pickupDate, returnDate });
      
      toast({
        title: t("hero.searchCompleted"),
        description: t("hero.searchCompletedDesc", { 
          location, 
          pickupDate: pickupDate.toLocaleDateString(), 
          returnDate: returnDate.toLocaleDateString() 
        }),
      });
      
      // Call the onSearch callback to update the parent component
      if (onSearch) {
        onSearch({ location, pickupDate, returnDate });
      }
      
      // Scroll to the cars section
      const carsSection = document.getElementById('cars');
      if (carsSection) {
        carsSection.scrollIntoView({ behavior: 'smooth' });
      }
      
    } catch (error) {
      toast({
        title: t("hero.searchFailed"),
        description: t("hero.searchFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-background via-muted/10 to-background py-20 border-b border-border overflow-hidden">
      {/* Modern geometric pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(45deg, transparent 35%, hsl(var(--foreground)) 35%, hsl(var(--foreground)) 37%, transparent 37%),
            linear-gradient(-45deg, transparent 35%, hsl(var(--foreground)) 35%, hsl(var(--foreground)) 37%, transparent 37%)
          `,
          backgroundSize: '60px 60px, 60px 60px, 40px 40px, 40px 40px'
        }}></div>
      </div>
      
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            hsl(var(--foreground)) 2px,
            hsl(var(--foreground)) 3px
          )`
        }}></div>
      </div>
      
      <div className="absolute top-32 right-32 w-24 h-24 border border-foreground/[0.03] rounded-xl rotate-12"></div>
      <div className="absolute bottom-32 left-32 w-16 h-16 bg-foreground/[0.02] rounded-2xl rotate-45"></div>
      <div className="absolute top-48 left-1/4 w-12 h-12 border border-foreground/[0.03] rounded-lg rotate-12"></div>
      <div className="absolute bottom-48 right-1/4 w-20 h-20 bg-foreground/[0.015] rounded-full"></div>
      
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <form
            className="flex flex-col md:flex-row gap-4 md:gap-2 justify-center"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder={t("hero.location")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full md:w-1/3 h-14 px-6 rounded-2xl border-0 bg-muted/50 hover:bg-muted transition-all duration-300 focus:ring-0 focus:bg-muted shadow-sm hover:shadow-md text-lg focus:outline-none"
              required
            />
            <div className="w-full md:w-1/4">
              <DatePicker
                date={pickupDate}
                onSelect={setPickupDate}
                placeholder={t("hero.pickupDate")}
                minDate={new Date()}
              />
            </div>
            <div className="w-full md:w-1/4">
              <DatePicker
                date={returnDate}
                onSelect={setReturnDate}
                placeholder={t("hero.returnDate")}
                minDate={pickupDate || new Date()}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto px-8 py-3 h-14 rounded-2xl bg-foreground text-background font-semibold text-lg shadow-lg hover:bg-foreground/90 transition btn-modern hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSearching ? t("hero.searching") : t("hero.searchCars")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
