
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Mail, Calendar } from "lucide-react";
import BookingNotifications from "@/components/BookingNotifications";
import ConversationsList from "@/components/ConversationsList";
import { useTranslation } from "react-i18next";

const Mailbox = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('Mailbox page - user:', user, 'loading:', loading);
    
    // Only redirect if auth is done loading and there's no user
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  console.log('Rendering Mailbox for user:', user.id);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">{t("mailbox.mailbox")}</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">{t("mailbox.manageMessages")}</p>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 sm:h-11 lg:h-12 mb-6 sm:mb-8">
            <TabsTrigger 
              value="messages" 
              className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg py-3 sm:py-2 lg:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">{t("mailbox.messages")}</span>
              <span className="xs:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg py-3 sm:py-2 lg:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t("mailbox.bookings")}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="mt-0">
            <ConversationsList currentUserId={user.id} />
          </TabsContent>
          
          <TabsContent value="bookings" className="mt-0">
            <BookingNotifications />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Mailbox;
