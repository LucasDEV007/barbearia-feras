import { lazy, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ServicosSection from "@/components/ServicosSection";
import LocationSection from "@/components/LocationSection";
import AppHeader from "@/components/AppHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstallAppBanner from "@/components/InstallAppBanner";
import LazyOnVisible from "@/components/LazyOnVisible";
import { BARBEARIA_NOME } from "@/lib/constants";
import { Scissors } from "lucide-react";

const GaleriaCortes = lazy(() => import("@/components/GaleriaCortes"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const CortesRecentesSection = lazy(() => import("@/components/CortesRecentesSection"));

const Index = () => {
  useEffect(() => {
    const prefetch = () => {
      import("@/components/GaleriaCortes");
      import("@/components/ReviewsSection");
      import("@/components/CortesRecentesSection");
    };
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (ric) {
      ric(prefetch, { timeout: 2000 });
    } else {
      const t = setTimeout(prefetch, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <HeroSection />
      <ServicosSection />
      <LazyOnVisible
        minHeightMobile={720}
        minHeightDesktop={560}
        bgClass="bg-secondary/30"
      >
        <GaleriaCortes />
      </LazyOnVisible>
      <LocationSection />
      <LazyOnVisible
        minHeightMobile={980}
        minHeightDesktop={520}
        bgClass="bg-secondary/30"
      >
        <ReviewsSection />
      </LazyOnVisible>
      <LazyOnVisible
        minHeightMobile={700}
        minHeightDesktop={540}
        bgClass="bg-background"
      >
        <CortesRecentesSection />
      </LazyOnVisible>

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
