import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import corteDegrade from "@/assets/corte-degrade.jpg";
import corteSocial from "@/assets/corte-social.jpg";
import corteAmericano from "@/assets/corte-americano.jpg";
import corteMoicano from "@/assets/corte-moicano.jpg";

const ESTILOS = [
  { nome: "Degradê", imagem: corteDegrade },
  { nome: "Social", imagem: corteSocial },
  { nome: "Americano", imagem: corteAmericano },
  { nome: "Moicano", imagem: corteMoicano },
] as const;

const GaleriaCortes = () => {
  const navigate = useNavigate();

  const handleEscolher = (estilo: string) => {
    navigate(`/agendar?estilo=${encodeURIComponent(estilo)}`);
  };

  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Galeria de Cortes
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Escolha o estilo que combina com você
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {ESTILOS.map((estilo) => (
            <div
              key={estilo.nome}
              className="group rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={estilo.imagem}
                  alt={`Corte ${estilo.nome}`}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 md:p-4 text-center space-y-2">
                <h3 className="font-semibold text-foreground text-lg">{estilo.nome}</h3>
                <Button
                  size="sm"
                  className="w-full font-semibold"
                  onClick={() => handleEscolher(estilo.nome)}
                >
                  Quero esse corte
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GaleriaCortes;
