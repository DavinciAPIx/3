
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 px-3 py-2"
      title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Globe size={16} />
      <span className="text-sm font-medium">
        {language === 'en' ? 'العربية' : 'EN'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
