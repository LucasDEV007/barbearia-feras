import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CortesRecentesSection = () => {
  const [cortes, setCortes] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: config } = await supabase
        .from("cortes_recentes_config")
        .select("*")
        .eq("ativo", true)
        .maybeSingle();

      if (!config) return;

      const { data } = await supabase
        .from("cortes_recentes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(config.limite || 6);

      if (data && data.length > 0) {
        setCortes(data);
        setVisible(true);
      }
    };
    fetch();
  }, []);

  if (!visible) return null;

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Últimos Cortes Realizados
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          Confira os trabalhos mais recentes da nossa barbearia
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          {cortes.map((c) => (
            <div key={c.id} className="group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src={c.imagem_url}
                  alt={c.estilo || "Corte recente"}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {(c.estilo || c.descricao) && (
                <div className="p-3 text-center">
                  {c.estilo && <h3 className="font-semibold text-foreground text-sm">{c.estilo}</h3>}
                  {c.descricao && <p className="text-xs text-muted-foreground mt-0.5">{c.descricao}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CortesRecentesSection;
