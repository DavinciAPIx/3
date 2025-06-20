
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  userName: string;
  onPhotoUpdate: (photoUrl: string) => void;
}

const ProfilePhotoUpload = ({ currentPhotoUrl, userName, onPhotoUpdate }: ProfilePhotoUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-documents')
        .getPublicUrl(fileName);

      // Update profile with photo URL - using any type to avoid TypeScript errors during type generation
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      onPhotoUpdate(publicUrl);
      setPreviewUrl(publicUrl);

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been successfully updated.",
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    setUploading(true);

    try {
      // Update profile to remove photo URL - using any type to avoid TypeScript errors during type generation
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null } as any)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      onPhotoUpdate('');
      setPreviewUrl(null);

      toast({
        title: "Profile photo removed",
        description: "Your profile photo has been removed.",
      });

    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Failed to remove photo",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <Card className="modern-card">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background shadow-elegant-lg">
              <AvatarImage src={displayUrl} alt={userName} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {displayUrl && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
                onClick={handleRemovePhoto}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={uploading}
              className="relative"
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Upload a profile photo (max 5MB)<br />
            Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoUpload;
