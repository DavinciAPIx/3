import { Car, User, LogOut, Shield, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MailboxLink from "./MailboxLink";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear mobile menu first
      setMobileMenuOpen(false);
      
      // Sign out from Supabase - handle session not found gracefully
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      // If session not found, treat as successful logout since user is already logged out
      if (error && !error.message.includes('Session not found') && !error.message.includes('session id') && !error.message.includes('doesn\'t exist')) {
        console.error('Logout error:', error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Logout successful, navigating to home...');
      
      // Navigate to home page after successful logout
      navigate("/");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, navigate to home and show success message
      // since the user likely wants to be logged out anyway
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const handleListCarClick = () => {
    setMobileMenuOpen(false);
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("auth.signInSubtitle"),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!profile) {
      toast({
        title: t("common.error"),
        description: t("auth.signUpSubtitle"),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (profile.user_type !== 'car_owner') {
      toast({
        title: t("common.error"),
        description: "Only car owners can list cars. Please contact support to change your account type.",
        variant: "destructive",
      });
      return;
    }

    navigate("/list-car");
  };

  const NavigationLinks = () => (
    <>
      <a 
        href="/#cars" 
        className="text-sm sm:text-base font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-muted/50"
        onClick={() => setMobileMenuOpen(false)}
      >
        {t("navbar.browseCars")}
      </a>
      
      <button 
        onClick={handleListCarClick}
        className="text-sm sm:text-base font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-muted/50 text-left"
      >
        {t("navbar.listYourCar")}
      </button>
    </>
  );

  const UserActions = () => (
    <>
      {loading ? (
        <div className="skeleton h-10 w-24"></div>
      ) : user ? (
        <div className={`flex items-center gap-2 lg:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {profile && (
            <div className="hidden md:block">
              <MailboxLink />
            </div>
          )}
          
          <LanguageToggle />
          
          {isAdmin && (
            <Button
              onClick={() => {
                navigate("/admin/verification");
                setMobileMenuOpen(false);
              }}
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2"
            >
              <Shield size={16} />
              {t("navbar.adminPanel")}
            </Button>
          )}
          
          {/* Desktop Profile Button */}
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            className="hidden md:flex items-center gap-3 px-3 py-2 h-auto hover:bg-muted/50 transition-colors duration-200 rounded-lg"
          >
            <div className={`text-right min-w-0 ${isRTL ? 'text-left' : 'text-right'}`}>
              <div className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || user.user_metadata?.full_name || user.email}
              </div>
              {profile && (
                <div className="text-xs text-muted-foreground truncate">
                  {profile.user_type === 'car_owner' ? t("navbar.carOwner") : t("navbar.carRenter")}
                </div>
              )}
            </div>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
              <AvatarFallback className="gradient-primary text-white text-sm font-medium">
                {(profile?.full_name || user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-destructive px-3"
          >
            <LogOut size={16} />
            <span className="hidden lg:inline">{t("navbar.logout")}</span>
          </Button>
        </div>
      ) : (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <LanguageToggle />
          <Button 
            onClick={() => {
              navigate("/auth");
              setMobileMenuOpen(false);
            }}
            className="btn-modern gradient-primary text-white hover:opacity-90 px-4 lg:px-6"
          >
            <span className="hidden sm:inline">{t("navbar.login")}</span>
            <span className="sm:hidden">{t("auth.signIn")}</span>
          </Button>
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <nav className={`max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Logo */}
        <a 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-primary hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            <img 
              src="/lovable-uploads/7ba09df2-aa1e-4957-b3c7-f2adfe8d8abf.png" 
              alt="Carflix Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <NavigationLinks />
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:block flex-shrink-0">
          <UserActions />
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 flex-shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <div className="px-4 sm:px-6 py-4 space-y-2">
            <div className="space-y-1">
              <NavigationLinks />
            </div>
            
            {user && (
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className={`flex items-center gap-3 px-3 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                    <AvatarFallback className="gradient-primary text-white text-sm font-medium">
                      {(profile?.full_name || user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {profile?.full_name || user.user_metadata?.full_name || user.email}
                    </div>
                    {profile && (
                      <div className="text-xs text-muted-foreground">
                        {profile.user_type === 'car_owner' ? t("navbar.carOwner") : t("navbar.carRenter")}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Button
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className={`w-full justify-start px-3 py-2 h-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <User size={16} className={isRTL ? 'ml-3' : 'mr-3'} />
                    <span className="text-sm">{t("navbar.profile")}</span>
                  </Button>
                  
                  {profile && (
                    <div className="w-full">
                      <MailboxLink />
                    </div>
                  )}
                  
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        navigate("/admin/verification");
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className={`w-full justify-start px-3 py-2 h-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Shield size={16} className={isRTL ? 'ml-3' : 'mr-3'} />
                      <span className="text-sm">{t("navbar.adminPanel")}</span>
                    </Button>
                  )}
                  
                  <div className="w-full">
                    <LanguageToggle />
                  </div>
                  
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className={`w-full justify-start text-muted-foreground hover:text-destructive px-3 py-2 h-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <LogOut size={16} className={isRTL ? 'ml-3' : 'mr-3'} />
                    <span className="text-sm">{t("navbar.logout")}</span>
                  </Button>
                </div>
              </div>
            )}
            
            {!user && (
              <div className="pt-4 border-t border-border/50">
                <UserActions />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
