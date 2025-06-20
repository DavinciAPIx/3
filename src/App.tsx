
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ListCar from "./pages/ListCar";
import CarDetails from "./pages/CarDetails";
import Mailbox from "./pages/Mailbox";
import AdminVerification from "./pages/AdminVerification";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from 'react';

const HeroSearch = lazy(() => import('@/components/HeroSearch'));
const FeaturedCars = lazy(() => import('@/components/FeaturedCars'));
const Map = lazy(() => import('@/components/Map'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/list-car" element={<ListCar />} />
              <Route path="/car/:id" element={<CarDetails />} />
              <Route path="/mailbox" element={<Mailbox />} />
              <Route path="/admin/verification" element={<AdminVerification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeroSearch />
      <FeaturedCars />
    </Suspense>
  );
}
