
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCarChat = (selectedCar: any) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const startChat = async () => {
    console.log('startChat called - user:', user?.id, 'selectedCar.ownerId:', selectedCar.ownerId);
    
    if (!user) {
      console.log('No user found, redirecting to auth');
      toast({
        title: "Login Required",
        description: "Please log in to contact the car owner",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedCar.ownerId) {
      console.error('No owner ID found for car');
      toast({
        title: "Error",
        description: "Unable to contact owner - owner information not available",
        variant: "destructive",
      });
      return;
    }

    // Check if user is trying to contact themselves
    if (user.id === selectedCar.ownerId) {
      toast({
        title: "Cannot Contact Yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting chat for car:', selectedCar.id, 'owner:', selectedCar.ownerId, 'user:', user.id);
      
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("renter_id", user.id)
        .eq("owner_id", selectedCar.ownerId)
        .eq("car_id", selectedCar.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing conversation:', fetchError);
        throw fetchError;
      }

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        setConversationId(existingConversation.id);
        setChatOpen(true);
        return;
      }

      // Create new conversation
      console.log('Creating new conversation...');
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          renter_id: user.id,
          owner_id: selectedCar.ownerId,
          car_id: selectedCar.id,
        })
        .select("id")
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw createError;
      }

      console.log('Created new conversation:', newConversation.id);
      setConversationId(newConversation.id);
      setChatOpen(true);
      
      toast({
        title: "Chat Started",
        description: "You can now message the car owner",
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    chatOpen,
    setChatOpen,
    conversationId,
    startChat,
  };
};
