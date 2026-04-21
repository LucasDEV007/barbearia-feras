import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { BARBEARIA_NOME } from "@/lib/constants";
import heroEmblem from "@/assets/hero-emblem.png";

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
        {/* Emblema dourado: tesoura + pente em moldura */}
        <div className="flex items-center justify-center mb-8">
          <img
            src={heroEmblem}
            alt="Barbearia Feras"
            width={224}
            height={224}
            fetchPriority="high"
            decoding="async"
            className="h-40 w-40 md:h-56 md:w-56 object-contain drop-shadow-[0_0_36px_hsl(var(--primary)/0.55)]"
          />
        </div>

        <h1 className="font-display text-6xl md:text-8xl font-bold mb-4 tracking-tight bg-gradient-to-b from-[hsl(43_85%_72%)] via-primary to-[hsl(38_75%_45%)] bg-clip-text text-transparent drop-shadow-[0_2px_18px_hsl(var(--primary)/0.4)]">
          {BARBEARIA_NOME}
        </h1>

        <p className="text-3xl md:text-4xl font-bold mt-6 mb-3 max-w-xl mx-auto leading-tight tracking-tight">
          <span className="text-foreground/90">Fera's não corta!</span>{" "}
          <span className="text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.45)]">Modela.</span>
        </p>
        {/* Linha decorativa dourada */}
        <div className="mx-auto my-6 h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="text-muted-foreground mb-10">
          Agende seu horário online de forma rápida e prática.
        </p>

        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <Link to="/agendar" className="w-full">
            <Button variant="outline" size="lg" className="w-full text-base md:text-lg px-10 py-6 font-bold tracking-widest uppercase rounded-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)] hover:shadow-[0_0_32px_-2px_hsl(var(--primary)/0.75)] transition-all">
              <Calendar className="h-5 w-5" />
              Agendar agora
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
