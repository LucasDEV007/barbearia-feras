import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RecompensaInfo {
  beneficio: string;
  pontoId: string;
  recompensasUtilizadas: number;
}

interface AgendamentoFormProps {
  onSubmit: (nome: string, telefone: string, beneficioAplicado: boolean) => void;
  loading?: boolean;
}

const AgendamentoForm = ({ onSubmit, loading }: AgendamentoFormProps) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [recompensa, setRecompensa] = useState<RecompensaInfo | null>(null);
  const [checkingReward, setCheckingReward] = useState(false);

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Check loyalty reward when phone has 11 digits
  useEffect(() => {
    const digits = telefone.replace(/\D/g, "");
    if (digits.length < 11) {
      setRecompensa(null);
      return;
    }

    const checkReward = async () => {
      setCheckingReward(true);
      try {
        // Check if program is active
        const { data: config } = await supabase
          .from("fidelidade_config")
          .select("*")
          .eq("ativo", true)
          .limit(1)
          .maybeSingle();

        if (!config) {
          setRecompensa(null);
          setCheckingReward(false);
          return;
        }

        // Check if client has reward available — search with formatted phone
        const { data: ponto } = await supabase
          .from("fidelidade_pontos")
          .select("*")
          .eq("telefone", telefone)
          .eq("recompensa_disponivel", true)
          .maybeSingle();

        if (ponto) {
          const pontoTyped = ponto as unknown as { id: string; recompensas_utilizadas: number };
          const configTyped = config as unknown as { beneficio: string };
          setRecompensa({
            beneficio: configTyped.beneficio,
            pontoId: pontoTyped.id,
            recompensasUtilizadas: pontoTyped.recompensas_utilizadas,
          });
        } else {
          setRecompensa(null);
        }
      } catch {
        setRecompensa(null);
      }
      setCheckingReward(false);
    };

    checkReward();
  }, [telefone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim() && telefone.trim()) {
      onSubmit(nome.trim(), telefone.trim(), !!recompensa);
    }
  };

  // Parse benefit description for display
  const getBeneficioDescricao = (beneficio: string) => {
    const lower = beneficio.toLowerCase();
    if (lower.includes("gratu") || lower.includes("grátis") || lower.includes("free")) {
      return `🎉 Parabéns! Você ganhou: ${beneficio}! O valor será R$ 0,00.`;
    }
    const match = beneficio.match(/(\d+)\s*%/);
    if (match) {
      return `🎉 Parabéns! Você ganhou: ${beneficio}! O desconto será aplicado automaticamente.`;
    }
    return `🎉 Parabéns! Você ganhou: ${beneficio}!`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input
          id="nome"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="bg-secondary border-border"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          required
          className="bg-secondary border-border"
        />
      </div>

      {checkingReward && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Verificando fidelidade...
        </p>
      )}

      {recompensa && (
        <div className="rounded-lg border border-success bg-success/10 p-4 flex items-start gap-3">
          <Gift className="h-5 w-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-success text-sm">
              {getBeneficioDescricao(recompensa.beneficio)}
            </p>
            <Badge className="mt-2 bg-success/20 text-success border-success/30 text-xs">
              Será aplicado neste agendamento
            </Badge>
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading || !nome.trim() || !telefone.trim()} className="w-full font-semibold">
        {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Agendando...</> : 
          recompensa ? "✨ Confirmar com Benefício" : "Confirmar Agendamento"}
      </Button>
    </form>
  );
};

export default AgendamentoForm;
