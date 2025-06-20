
import { useNavigate } from "react-router-dom";
import { ArrowRight, DollarSign, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const OwnerCTA = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const benefits = [
    {
      icon: DollarSign,
      title: t("owner.earnIncome"),
      description: t("owner.earnIncomeDesc")
    },
    {
      icon: Shield,
      title: t("owner.secureProtected"),
      description: t("owner.secureProtectedDesc")
    },
    {
      icon: Clock,
      title: t("owner.flexibleSchedule"),
      description: t("owner.flexibleScheduleDesc")
    }
  ];

  return (
    <section className="relative overflow-hidden py-32 mt-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-foreground leading-[1.1] tracking-tight">
                {t("owner.title")} 
                <span className="text-gradient block">{t("owner.subtitle")}</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                {t("owner.description")}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.title}
                  className={`flex items-start gap-6 fade-in-up delay-${(index + 1) * 100} hover-lift`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="text-background" size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed font-light">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("/list-car")}
              size="lg"
              className="btn-modern bg-foreground text-background hover:bg-foreground/90 text-lg px-8 py-6 h-auto font-medium group"
            >
              {t("owner.startEarning")}
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative cta-image-container">
              <img
                src="/lovable-uploads/daa8151a-61b1-437f-abd9-04b5be0dd60b.png"
                alt="Car sharing illustration - rent a car and become a host"
                className="cta-image rounded-3xl shadow-elegant-lg"
              />
              <div className="cta-image-overlay"></div>
            </div>
            
            {/* Floating cards */}
            <Card className="absolute -top-6 -right-6 w-52 modern-card glass">
              <CardContent className="p-6">
                <div className="text-3xl font-black text-foreground">{t("common.currency")} 2,500</div>
                <div className="text-sm text-muted-foreground font-medium">{t("owner.monthlyEarnings")}</div>
              </CardContent>
            </Card>
            
            <Card className="absolute -bottom-6 -left-6 w-48 modern-card glass">
              <CardContent className="p-6">
                <div className="text-3xl font-black text-foreground">98%</div>
                <div className="text-sm text-muted-foreground font-medium">{t("owner.ownerSatisfaction")}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCTA;
