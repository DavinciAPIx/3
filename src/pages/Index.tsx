
import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import FeaturedCars from "@/components/FeaturedCars";
import OwnerCTA from "@/components/OwnerCTA";
import RenterCTA from "@/components/RenterCTA";
import { useTranslation } from "react-i18next";

interface SearchResults {
  location: string;
  pickupDate: Date;
  returnDate: Date;
}

const Index = () => {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const { t } = useTranslation();

  const handleSearch = (results: SearchResults) => {
    console.log('Search triggered with results:', results);
    setSearchResults(results);
  };

  return (
    <div className="bg-background min-h-screen w-full">
      <Navbar />

      <main className="fade-in-up">
        <HeroSearch onSearch={handleSearch} />

        <section className="max-w-7xl mx-auto mt-32 px-6 delay-200 fade-in-up">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 text-gradient tracking-tight">
              {searchResults ? t("cars.carsIn", { location: searchResults.location }) : t("cars.featuredCars")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              {searchResults 
                ? t("cars.availableFrom", { 
                    pickupDate: searchResults.pickupDate.toLocaleDateString(), 
                    returnDate: searchResults.returnDate.toLocaleDateString() 
                  })
                : t("cars.discover")
              }
            </p>
          </div>
          <FeaturedCars searchResults={searchResults} />
        </section>

        <div className="delay-300 fade-in-up">
          <RenterCTA />
        </div>

        <div className="delay-400 fade-in-up">
          <OwnerCTA />
        </div>
      </main>
    </div>
  );
};

export default Index;
