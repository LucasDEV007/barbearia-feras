import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

/**
 * Fetches active services (public landing/booking flow).
 * Returns list ordered by `ordem`.
 */
export function useServicosAtivos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("servicos")
      .select("id, nome, preco, duracao, descricao, icone, ordem, ativo")
      .eq("ativo", true)
      .order("ordem", { ascending: true });
    setServicos(
      ((data ?? []) as any[]).map((s) => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco),
        duracao: s.duracao,
        descricao: s.descricao ?? "",
        icone: s.icone ?? "Scissors",
        ordem: s.ordem ?? 0,
        ativo: s.ativo,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServicos();
  }, [fetchServicos]);

  return { servicos, loading, refetch: fetchServicos };
}