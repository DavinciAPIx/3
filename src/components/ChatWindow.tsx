
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  ownerName: string;
  carTitle?: string;
  onClose: () => void;
  currentUserId: string;
}

const ChatWindow = ({ conversationId, ownerName, carTitle, onClose, currentUserId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) return;
    
    fetchMessages();
    setupRealtimeSubscription();
    
    return () => {
      cleanupChannel();
    };
  }, [conversationId]);

  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('Cleaning up channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages:', data);
      setMessages(data || []);
      
      // Mark messages as read if they're not from current user
      const unreadMessages = data?.filter(msg => 
        msg.sender_id !== currentUserId && !msg.is_read
      ) || [];
      
      if (unreadMessages.length > 0) {
        await markMessagesAsRead(unreadMessages.map(msg => msg.id));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    cleanupChannel();

    console.log('Setting up realtime subscription for conversation:', conversationId);
    
    const channel = supabase
      .channel(`messages-${conversationId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            // Check if message already exists
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping');
              return prev;
            }
            
            console.log('Adding new message to state');
            return [...prev, newMessage];
          });
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== currentUserId) {
            markMessagesAsRead([newMessage.id]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as Message;
          setMessages((prev) => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    setLoading(true);
    
    try {
      console.log('Sending message:', messageContent);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: currentUserId,
        content: messageContent,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      
      // Add optimistic message immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: messageContent,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      
      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => msg.id === optimisticMessage.id ? data : msg)
      );
      
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
        
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 z-50 shadow-lg flex flex-col">
      <ChatHeader ownerName={ownerName} carTitle={carTitle} onClose={onClose} />
      <CardContent className="flex flex-col flex-1 p-0 min-h-0">
        <MessageList messages={messages} currentUserId={currentUserId} />
        <MessageInput onSendMessage={handleSendMessage} loading={loading} />
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
