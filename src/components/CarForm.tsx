
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';

interface CarFormData {
  title: string;
  description: string;
  price_per_day: number;
  location: string;
  image_url: string;
}

interface Car {
  id: number;
  title: string;
  description: string | null;
  price_per_day: number;
  location: string | null;
  image_url: string | null;
  is_available: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
  approval_status: string;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

interface CarFormProps {
  car?: Car;
  onSuccess: () => void;
}

const CarForm = ({ car, onSuccess }: CarFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!car;

  const { register, handleSubmit, formState: { errors } } = useForm<CarFormData>({
    defaultValues: {
      title: car?.title || '',
      description: car?.description || '',
      price_per_day: car?.price_per_day || 0,
      location: car?.location || '',
      image_url: car?.image_url || '',
    }
  });

  // Create/Update car mutation
  const saveCarMutation = useMutation({
    mutationFn: async (data: CarFormData) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User must be authenticated');
      }

      if (isEditing) {
        const { data: updatedCar, error } = await supabase
          .from('cars')
          .update(data)
          .eq('id', car.id)
          .select()
          .single();
        
        if (error) throw error;
        return updatedCar;
      } else {
        const { data: newCar, error } = await supabase
          .from('cars')
          .insert({
            ...data,
            owner_id: user.id,
            is_available: true,
            approval_status: 'approved' // Admin-created cars are auto-approved
          })
          .select()
          .single();
        
        if (error) throw error;
        return newCar;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCars'] });
      queryClient.invalidateQueries({ queryKey: ['featuredCars'] });
      toast({
        title: isEditing ? "Car Updated" : "Car Added",
        description: `Car has been successfully ${isEditing ? 'updated' : 'added'}.`,
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving car:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} car.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CarFormData) => {
    saveCarMutation.mutate(data);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Car' : 'Add New Car'}</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g., Toyota Land Cruiser"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe the car's features and condition..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_per_day">Price per Day (SAR) *</Label>
            <Input
              id="price_per_day"
              type="number"
              step="0.01"
              {...register('price_per_day', { 
                required: 'Price is required',
                min: { value: 1, message: 'Price must be at least 1 SAR' }
              })}
              placeholder="300"
            />
            {errors.price_per_day && (
              <p className="text-sm text-destructive">{errors.price_per_day.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., Riyadh, Jeddah, Khobar"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            {...register('image_url')}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="submit" 
            disabled={saveCarMutation.isPending}
            className="px-6"
          >
            {saveCarMutation.isPending 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Update Car' : 'Add Car')
            }
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default CarForm;
