import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";
import CarDetailsForm from "./CarDetailsForm";
import CarFeaturesSelector from "./CarFeaturesSelector";
import LocationPricingForm from "./LocationPricingForm";
import PhotoUploadSection from "./PhotoUploadSection";

const ListCarForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    type: "",
    seats: "",
    transmission: "",
    fuel: "",
    price: "",
    location: "",
    description: "",
    features: [] as string[]
  });

  const [carPhotos, setCarPhotos] = useState<string[]>([]);

  // Mutation to submit car listing
  const submitCarMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('User not authenticated');

      const carData = {
        title: `${data.make} ${data.model} ${data.year}`,
        description: data.description || null,
        price_per_day: parseFloat(data.price),
        location: data.location || null,
        owner_id: user.id,
        is_available: false, // Not available until approved
        approval_status: 'pending',
        image_url: carPhotos.length > 0 ? carPhotos[0] : null // Use first photo as main image
      };

      console.log('Creating car with data:', carData);
      const { data: newCar, error } = await supabase
        .from('cars')
        .insert(carData)
        .select()
        .single();

      if (error) {
        console.error('Error creating car:', error);
        throw error;
      }

      console.log('Car created successfully:', newCar);

      // Save all photos to car_photos table
      if (carPhotos.length > 0) {
        console.log('Saving', carPhotos.length, 'photos for car ID:', newCar.id);
        
        const photoInserts = carPhotos.map((photoUrl, index) => ({
          car_id: newCar.id,
          photo_url: photoUrl,
          display_order: index
        }));

        console.log('Photo inserts:', photoInserts);

        const { error: photosError } = await supabase
          .from('car_photos')
          .insert(photoInserts);

        if (photosError) {
          console.error('Error saving photos:', photosError);
          // Don't throw error here, car is already created
          toast({
            title: "Warning",
            description: "Car created but some photos failed to save. You can add them later.",
            variant: "destructive",
          });
        } else {
          console.log('Photos saved successfully');
        }
      }

      return newCar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCars'] });
      toast({
        title: "Car Listing Submitted!",
        description: "Your car has been submitted for admin review. You'll be notified once it's approved.",
      });
      
      // Reset form
      setFormData({
        make: "",
        model: "",
        year: "",
        type: "",
        seats: "",
        transmission: "",
        fuel: "",
        price: "",
        location: "",
        description: "",
        features: []
      });
      setCarPhotos([]);
    },
    onError: (error) => {
      console.error('Error submitting car:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your car listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter(f => f !== feature)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'type', 'seats', 'transmission', 'fuel', 'price'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate photos
    if (carPhotos.length < 3) {
      toast({
        title: "Photos Required",
        description: "Please upload at least 3 photos of your car.",
        variant: "destructive",
      });
      return;
    }

    submitCarMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Car Details */}
      <Card>
        <CardHeader>
          <CardTitle>Car Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CarDetailsForm formData={formData} setFormData={setFormData} />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <CarFeaturesSelector 
            selectedFeatures={formData.features}
            onFeatureChange={handleFeatureChange}
          />
        </CardContent>
      </Card>

      {/* Location & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationPricingForm formData={formData} setFormData={setFormData} />
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploadSection onPhotosChange={setCarPhotos} />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-center">
        <Button 
          type="submit" 
          size="lg" 
          className="px-12"
          disabled={submitCarMutation.isPending}
        >
          {submitCarMutation.isPending ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </div>
    </form>
  );
};

export default ListCarForm;
