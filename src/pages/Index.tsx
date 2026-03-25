import HeroSection from "@/components/HeroSection";
import ServicosSection from "@/components/ServicosSection";
import AppHeader from "@/components/AppHeader";
import { BARBEARIA_NOME } from "@/lib/constants";
import { Scissors } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <HeroSection />
      <ServicosSection />

      <footer className="border-t border-border py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <Scissors className="h-5 w-5" />
          <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{BARBEARIA_NOME}</span>
        </div>
        <p className="text-muted-foreground text-sm">© 2026 — Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default Index;
