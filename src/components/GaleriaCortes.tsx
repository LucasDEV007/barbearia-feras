import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import corteDegrade from "@/assets/corte-degrade.jpg";
import corteSocial from "@/assets/corte-social.jpg";
import corteAmericano from "@/assets/corte-americano.jpg";
import corteMoicano from "@/assets/corte-moicano.jpg";

const ESTILOS = [
  { nome: "Degradê", descricao: "Laterais em transição suave com topo mais volumoso.", imagem: corteDegrade },
  { nome: "Social", descricao: "Corte clássico e elegante.", imagem: corteSocial },
  { nome: "Americano", descricao: "Laterais curtas com topo médio estilizado.", imagem: corteAmericano },
  { nome: "Moicano", descricao: "Laterais raspadas com faixa central mais longa.", imagem: corteMoicano },
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
              className="group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={estilo.imagem}
                  alt={`Corte ${estilo.nome}`}
                  loading="lazy"
                  width={512}
                  height={682}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{estilo.nome}</h3>
                  <p className="text-white/80 text-sm mb-3 line-clamp-2">{estilo.descricao}</p>
                  <Button
                    size="sm"
                    className="w-full font-semibold"
                    onClick={() => handleEscolher(estilo.nome)}
                  >
                    Quero esse corte
                  </Button>
                </div>
              </div>
              {/* Always visible on mobile */}
              <div className="p-3 md:hidden text-center space-y-1.5">
                <h3 className="font-semibold text-foreground">{estilo.nome}</h3>
                <p className="text-xs text-muted-foreground">{estilo.descricao}</p>
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
