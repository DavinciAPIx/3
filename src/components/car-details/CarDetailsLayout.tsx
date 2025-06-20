
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import CarDetailsHeader from "@/components/CarDetailsHeader";

interface CarDetailsLayoutProps {
  children: ReactNode;
  selectedCar: any;
}

const CarDetailsLayout = ({ children, selectedCar }: CarDetailsLayoutProps) => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <CarDetailsHeader selectedCar={selectedCar} />
        {children}
      </main>
    </div>
  );
};

export default CarDetailsLayout;
