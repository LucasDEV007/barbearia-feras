import { Card, CardContent } from "@/components/ui/card";
import { SERVICOS } from "@/lib/constants";

const ServicosSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Nossos Serviços
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICOS.map((servico) => (
            <Card key={servico.nome} className="bg-card border-border hover:border-primary/50 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">{servico.icone}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{servico.nome}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{servico.descricao}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">R$ {servico.preco}</span>
                      <span className="text-xs text-muted-foreground">{servico.duracao} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicosSection;
