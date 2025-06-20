
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import ListCarForm from "@/components/car-listing/ListCarForm";

const ListCar = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to load before making decisions
    if (authLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list your car.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // If user has a profile but is not a car owner, redirect
    if (profile && profile.user_type !== 'car_owner') {
      toast({
        title: "Access Denied",
        description: "Only car owners can list cars. Please contact support if you need to change your account type.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [user, profile, authLoading, profileLoading, navigate, toast]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">List Your Car</h1>
          <p className="text-lg text-muted-foreground">
            Start earning money by sharing your car with trusted renters
          </p>
          
          {/* Updated info box */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              📝 <strong>Note:</strong> Your car listing will be submitted for admin review. 
              Once approved, it will be visible to potential renters. You can complete your{" "}
              <button 
                onClick={() => navigate("/profile")}
                className="underline font-semibold hover:text-blue-900"
              >
                profile verification
              </button>
              {" "}to speed up future approvals.
            </p>
          </div>
        </div>

        <ListCarForm />
      </main>
    </div>
  );
};

export default ListCar;
