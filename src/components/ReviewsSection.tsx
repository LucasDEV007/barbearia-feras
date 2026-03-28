import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AVALIACOES = [
  { nome: "Lucas M.", estrelas: 5, texto: "Melhor barbearia da região! Atendimento impecável e corte perfeito." },
  { nome: "Pedro H.", estrelas: 5, texto: "Sempre saio satisfeito. O combo corte + barba é sensacional!" },
  { nome: "Rafael S.", estrelas: 5, texto: "Ambiente top, profissionais de qualidade. Recomendo demais!" },
  { nome: "João V.", estrelas: 4, texto: "Ótimo corte e preço justo. Voltarei com certeza." },
  { nome: "Carlos A.", estrelas: 5, texto: "Fui indicado por um amigo e não me arrependo. Virei cliente fiel!" },
  { nome: "Matheus R.", estrelas: 5, texto: "Atendimento nota 10! Pontualidade e qualidade no serviço." },
];

const ReviewsSection = () => {
  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Avaliações de Clientes
          </h2>
          <p className="text-muted-foreground">O que nossos clientes dizem sobre nós</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVALIACOES.map((av, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < av.estrelas ? "text-primary fill-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p className="text-foreground text-sm mb-3">"{av.texto}"</p>
                <p className="text-xs text-muted-foreground font-medium">— {av.nome}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
