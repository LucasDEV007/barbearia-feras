import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import ServicosSection from "@/components/ServicosSection";
import LocationSection from "@/components/LocationSection";
import AppHeader from "@/components/AppHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstallAppBanner from "@/components/InstallAppBanner";
import { BARBEARIA_NOME } from "@/lib/constants";
import { Scissors } from "lucide-react";

const GaleriaCortes = lazy(() => import("@/components/GaleriaCortes"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const CortesRecentesSection = lazy(() => import("@/components/CortesRecentesSection"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <HeroSection />
      <ServicosSection />
      <Suspense fallback={null}>
        <GaleriaCortes />
      </Suspense>
      <LocationSection />
      <Suspense fallback={null}>
        <ReviewsSection />
        <CortesRecentesSection />
      </Suspense>

      <footer className="border-t border-border py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <Scissors className="h-5 w-5" />
          <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{BARBEARIA_NOME}</span>
        </div>
        <p className="text-muted-foreground text-sm">© 2026 — Todos os direitos reservados</p>
      </footer>
      <WhatsAppButton />
      <InstallAppBanner />
    </div>
  );
};

export default Index;
