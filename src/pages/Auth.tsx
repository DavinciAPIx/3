
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Sparkles } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);

  useEffect(() => {
    console.log('Auth useEffect - user:', user?.email, 'profile:', profile?.user_type, 'isNewSignup:', isNewSignup);
    
    if (user && profile && !profileLoading) {
      console.log('User and profile exist, redirecting...');
      
      // Add a small delay to show the redirect message
      const redirectTimer = setTimeout(() => {
        // Redirect based on user type and whether it's a new signup
        if (isNewSignup && profile.user_type === 'car_owner') {
          console.log('Redirecting new car owner to /list-car');
          navigate("/list-car", { replace: true });
        } else {
          console.log('Redirecting to home page');
          navigate("/", { replace: true });
        }
      }, 1500); // Show redirect message for 1.5 seconds

      return () => clearTimeout(redirectTimer);
    }
  }, [user, profile, profileLoading, navigate, isNewSignup]);

  // Don't show auth form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-6">
        <Card className="modern-card glass max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {profileLoading ? 'Setting up your profile...' : 'Welcome back!'}
            </h3>
            <p className="text-muted-foreground">
              {profileLoading ? 'Please wait while we prepare your dashboard.' : 'Redirecting you to your dashboard...'}
            </p>
            {user && !profile && !profileLoading && (
              <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Profile not found. This might be a new account setting up.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Architectural Image - Left Side */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full opacity-15">
          <img 
            src="/lovable-uploads/03de0ece-b7b3-42c8-b90e-3c6470916813.png" 
            alt="Modern architecture at night"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
        </div>
      </div>

      {/* Background Car Image - Right Side */}
      <div className="absolute inset-0 z-0">
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full opacity-20">
          <img 
            src="/lovable-uploads/c838b0b7-8c9a-4e6c-8a55-f4ff64e862fc.png" 
            alt="Luxury car in forest"
            className="w-full h-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/60"></div>
        </div>
      </div>

      <div className="w-full max-w-md fade-in-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/a835484b-b1ae-4487-8af7-44b1110acf25.png" 
              alt="Carflix Logo" 
              className="h-16 object-contain"
            />
          </div>
          <p className="text-white/80 text-lg">Join Saudi Arabia's leading car sharing platform</p>
        </div>

        {/* Auth Card */}
        <Card className="modern-card glass">
          <CardContent className="p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 h-12">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white data-[state=active]:text-primary rounded-lg transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary rounded-lg transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
                  <p className="text-white/70">Sign in to your account to continue</p>
                </div>
                <SignInForm loading={loading} setLoading={setLoading} />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-2">Get Started</h2>
                  <p className="text-white/70">Create your account to join our community</p>
                </div>
                <SignUpForm 
                  loading={loading} 
                  setLoading={setLoading} 
                  onSignupSuccess={() => setIsNewSignup(true)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="text-white/80">
            <div className="text-2xl font-bold">1000+</div>
            <div className="text-sm">Happy Users</div>
          </div>
          <div className="text-white/80">
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm">Available Cars</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
