
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PhotoUploadSectionProps {
  onPhotosChange?: (photos: string[]) => void;
  carId?: number; // Add carId prop for existing cars
}

const PhotoUploadSection = ({ onPhotosChange, carId }: PhotoUploadSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    // Validate file count
    if (files.length + uploadedPhotos.length > 10) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 10 photos.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newPhotoUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        // Create file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/car-${Date.now()}-${i}.${fileExt}`;

        console.log('Uploading file:', fileName);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('car-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('car-photos')
          .getPublicUrl(fileName);

        console.log('Upload successful, public URL:', publicUrl);
        newPhotoUrls.push(publicUrl);

        // If carId is provided (editing existing car), save to car_photos table
        if (carId) {
          const { error: dbError } = await supabase
            .from('car_photos')
            .insert({
              car_id: carId,
              photo_url: publicUrl,
              display_order: uploadedPhotos.length + newPhotoUrls.length - 1
            });

          if (dbError) {
            console.error('Error saving photo to database:', dbError);
          }
        }
      }

      if (newPhotoUrls.length > 0) {
        const updatedPhotos = [...uploadedPhotos, ...newPhotoUrls];
        setUploadedPhotos(updatedPhotos);
        onPhotosChange?.(updatedPhotos);

        toast({
          title: "Photos uploaded",
          description: `Successfully uploaded ${newPhotoUrls.length} photo(s).`,
        });
      }

    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;

      console.log('Removing file:', filePath);

      // Delete from storage
      const { error } = await supabase.storage
        .from('car-photos')
        .remove([filePath]);

      if (error) {
        console.error('Error removing file:', error);
      }

      // If carId is provided, also remove from car_photos table
      if (carId) {
        const { error: dbError } = await supabase
          .from('car_photos')
          .delete()
          .eq('car_id', carId)
          .eq('photo_url', photoUrl);

        if (dbError) {
          console.error('Error removing photo from database:', dbError);
        }
      }

      const updatedPhotos = uploadedPhotos.filter((_, i) => i !== index);
      setUploadedPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);

      toast({
        title: "Photo removed",
        description: "Photo has been successfully removed.",
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Failed to remove photo",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Photos</h3>
        <span className="text-sm text-muted-foreground">
          ({uploadedPhotos.length}/10)
        </span>
      </div>

      {/* Photo Grid */}
      {uploadedPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {uploadedPhotos.map((photoUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={photoUrl}
                alt={`Car photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(photoUrl, index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Add photos of your car</p>
        <p className="text-muted-foreground mb-4">
          Upload at least 3 photos showing exterior, interior, and any damage (max 10 photos, 5MB each)
        </p>
        <Button 
          type="button" 
          variant="outline" 
          disabled={uploading || uploadedPhotos.length >= 10}
          className="relative"
        >
          <Image className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || uploadedPhotos.length >= 10}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </Button>
      </div>

      {uploadedPhotos.length < 3 && (
        <p className="text-sm text-yellow-600">
          ⚠️ Please upload at least 3 photos for better visibility
        </p>
      )}
    </div>
  );
};

export default PhotoUploadSection;
