import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";
import { BARBEARIA_NOME } from "@/lib/constants";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--primary)) 0, hsl(var(--primary)) 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Scissors className="h-10 w-10 text-primary" />
          <div className="h-px w-16 bg-primary" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 tracking-tight">
          {BARBEARIA_NOME}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-xl mx-auto">
          Fera's não corta! Modela.
        </p>
        <p className="text-muted-foreground mb-10">
          Agende seu horário online de forma rápida e prática.
        </p>

        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <Link to="/agendar" className="w-full">
            <Button size="lg" className="w-full text-lg px-10 py-6 font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              Agendar agora →
            </Button>
          </Link>
          <Link to="/meus-agendamentos" className="w-full">
            <Button variant="outline" size="lg" className="w-full text-base px-10 py-6 font-semibold rounded-full bg-background/40 backdrop-blur border-border hover:bg-accent transition-all">
              Meus agendamentos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
