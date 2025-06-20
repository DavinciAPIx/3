
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SignInFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const SignInForm = ({ loading, setLoading }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { t } = useTranslation();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = t('signIn.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('signIn.errors.emailInvalid');
    if (!password) newErrors.password = t('signIn.errors.passwordRequired');
    else if (password.length < 6) newErrors.password = t('signIn.errors.passwordMinLength');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <Label htmlFor="email">{t('signIn.emailLabel')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            placeholder={t('signIn.emailPlaceholder')}
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pl-10`}
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full"
      >
        {loading ? t('common.loading') : t('signIn.signInButton')}
      </Button>
    </form>
  );
};

export default SignInForm;
