
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useOwnerProfile = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: ['ownerProfile', ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      
      console.log('Fetching owner profile for:', ownerId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ownerId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching owner profile:', error);
        // Return default data instead of throwing to ensure component shows something
        return { 
          id: ownerId,
          full_name: "Car Owner",
          avatar_url: null,
          phone: null,
          user_type: "car_owner",
          created_at: new Date().toISOString()
        };
      }
      
      console.log('Fetched owner profile:', data);
      return data || { 
        id: ownerId,
        full_name: "Car Owner",
        avatar_url: null,
        phone: null,
        user_type: "car_owner",
        created_at: new Date().toISOString()
      };
    },
    enabled: !!ownerId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
