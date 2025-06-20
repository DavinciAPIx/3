
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const MailboxLink = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();
    
    // Set up real-time subscription for unread messages
    const channel = supabase
      .channel(`mailbox-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log('Message change detected:', payload);
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          console.log('Conversation change detected');
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      console.log('Fetching unread count for user:', user.id);
      
      // Get ALL conversations where user participates (either as renter or owner)
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`);

      if (convError) {
        console.error("Error fetching conversations for unread count:", convError);
        return;
      }

      const conversationIds = conversations?.map(c => c.id) || [];
      console.log('User conversations for unread count:', conversationIds);

      if (conversationIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Count unread messages in those conversations
      const { count, error: countError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      if (countError) {
        console.error("Error fetching unread message count:", countError);
        return;
      }

      console.log('Unread count:', count);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMailboxClick = () => {
    console.log('Mailbox clicked, navigating to /mailbox');
    navigate("/mailbox");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleMailboxClick}
      className="relative w-full justify-start px-3 py-2 h-auto text-sm sm:text-base hover:bg-muted/50 transition-colors duration-200 rounded-lg"
    >
      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-3 flex-shrink-0" />
      <span>{t("mailbox.mailbox")}</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-medium shadow-lg">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default MailboxLink;
