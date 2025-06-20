
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, User } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import { useTranslation } from "react-i18next";

interface Conversation {
  id: string;
  renter_id: string;
  owner_id: string;
  car_id: number;
  created_at: string;
  updated_at: string;
}

interface ConversationWithUserInfo extends Conversation {
  otherUserName: string;
  otherUserAvatar: string | null;
  carTitle: string;
}

interface ConversationsListProps {
  currentUserId: string;
}

const ConversationsList = ({ currentUserId }: ConversationsListProps) => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    ownerName: string;
    carTitle?: string;
  } | null>(null);
  const { t } = useTranslation();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      console.log('Fetching conversations for user:', currentUserId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`renter_id.eq.${currentUserId},owner_id.eq.${currentUserId}`)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      
      console.log('Fetched conversations:', data);
      
      // Fetch user profiles and car details for each conversation
      const conversationsWithInfo: ConversationWithUserInfo[] = [];
      
      for (const conversation of data) {
        const isOwner = conversation.owner_id === currentUserId;
        const otherUserId = isOwner ? conversation.renter_id : conversation.owner_id;
        
        // Fetch other user's profile with avatar
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();
        
        // Fetch car title
        const { data: carData } = await supabase
          .from('cars')
          .select('title')
          .eq('id', conversation.car_id)
          .maybeSingle();
        
        conversationsWithInfo.push({
          ...conversation,
          otherUserName: profileData?.full_name || (isOwner ? 'Renter' : 'Car Owner'),
          otherUserAvatar: profileData?.avatar_url || null,
          carTitle: carData?.title || `Car ID: ${conversation.car_id}`
        });
      }
      
      return conversationsWithInfo;
    },
    enabled: !!currentUserId,
  });

  const handleConversationClick = (conversation: ConversationWithUserInfo) => {
    setSelectedConversation({
      id: conversation.id,
      ownerName: conversation.otherUserName,
      carTitle: conversation.carTitle
    });
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="skeleton h-6 w-48 mx-auto mb-4"></div>
              <div className="skeleton h-4 w-32 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Card className="modern-card">
        <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            {t("mailbox.messages")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3">{t("mailbox.noConversations")}</h3>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t("mailbox.noConversationsDesc")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="modern-card">
        <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            {t("mailbox.messages")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <div className="space-y-3 sm:space-y-4">
            {conversations.map((conversation) => {
              const isOwner = conversation.owner_id === currentUserId;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 lg:p-6 border border-border/50 rounded-xl hover:bg-muted/30 hover:border-border transition-all duration-200 cursor-pointer active:bg-muted/50 hover-lift"
                >
                  <div className="flex-shrink-0">
                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border-2 border-background shadow-lg">
                      <AvatarImage 
                        src={conversation.otherUserAvatar || undefined} 
                        alt={conversation.otherUserName} 
                      />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg sm:text-xl">
                        {conversation.otherUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="font-semibold truncate text-base sm:text-lg lg:text-xl text-foreground">
                        {conversation.otherUserName}
                      </h4>
                      <span className="text-xs sm:text-sm text-muted-foreground ml-3 flex-shrink-0">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground truncate mb-1">
                      {conversation.carTitle}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground/80">
                      {isOwner ? 'As owner' : 'As renter'}
                    </p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 p-0 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  >
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedConversation && (
        <ChatWindow
          conversationId={selectedConversation.id}
          ownerName={selectedConversation.ownerName}
          carTitle={selectedConversation.carTitle}
          onClose={handleCloseChat}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

export default ConversationsList;
