
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const RenterCTA = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Search,
      title: t("renter.easyDiscovery"),
      description: t("renter.easyDiscoveryDesc")
    },
    {
      icon: Shield,
      title: t("renter.safeSecure"),
      description: t("renter.safeSecureDesc")
    },
    {
      icon: Clock,
      title: t("renter.instantBooking"),
      description: t("renter.instantBookingDesc")
    }
  ];

  return (
    <section className="relative overflow-hidden py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative cta-image-container">
              <img
                src="/lovable-uploads/f62175df-b3bf-4920-a8c0-a22d3d2b8cd5.png"
                alt="Car rental experience - find and rent the perfect car"
                className="cta-image rounded-3xl shadow-elegant-lg"
              />
              <div className="cta-image-overlay"></div>
            </div>
            
            {/* Floating cards */}
            <Card className="absolute -top-6 -left-6 w-48 modern-card glass">
              <CardContent className="p-6">
                <div className="text-3xl font-black text-foreground">500+</div>
                <div className="text-sm text-muted-foreground font-medium">{t("renter.carsAvailable")}</div>
              </CardContent>
            </Card>
            
            <Card className="absolute -bottom-6 -right-6 w-52 modern-card glass">
              <CardContent className="p-6">
                <div className="text-3xl font-black text-foreground">4.9★</div>
                <div className="text-sm text-muted-foreground font-medium">{t("renter.averageRating")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="space-y-10 order-1 lg:order-2">
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-foreground leading-[1.1] tracking-tight">
                {t("renter.title")}
                <span className="text-gradient block">{t("renter.subtitle")}</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                {t("renter.description")}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.title}
                  className={`flex items-start gap-6 fade-in-up delay-${(index + 1) * 100} hover-lift`}
                >
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="text-white" size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed font-light">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="btn-modern gradient-primary text-white hover:scale-105 text-lg px-8 py-6 h-auto font-medium group"
            >
              {t("renter.startJourney")}
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RenterCTA;
