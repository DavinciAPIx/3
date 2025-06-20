
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_type: 'car_owner' | 'car_renter';
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', user.id);
      
      // Use select without .single() first to see if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (data && data.length > 0) {
        console.log('Profile found:', data[0]);
        setProfile(data[0] as Profile);
      } else {
        console.log('No profile found, user might be newly created');
        // If no profile exists, try to create one from user metadata
        const userMetadata = user.user_metadata;
        if (userMetadata?.full_name || userMetadata?.user_type) {
          console.log('Creating profile from user metadata');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: userMetadata.full_name || null,
              phone: userMetadata.phone || null,
              user_type: userMetadata.user_type || 'car_renter',
              avatar_url: null,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setProfile(null);
          } else {
            console.log('Profile created successfully:', newProfile);
            setProfile(newProfile as Profile);
          }
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, refetch: fetchProfile };
};
