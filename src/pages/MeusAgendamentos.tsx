import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Search, Scissors, Calendar as CalendarIcon, Clock, Timer, DollarSign, ArrowLeft, CalendarX } from "lucide-react";
import { SERVICOS } from "@/lib/constants";
import { toast } from "sonner";

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  status: string;
  estilo: string | null;
}

const formatTelefone = (value: string) => {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const formatData = (data: string) => {
  const [y, m, d] = data.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const formatado = dt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return formatado.charAt(0).toUpperCase() + formatado.slice(1);
};

const calcDuracaoEPreco = (servicoTexto: string) => {
  const itens = servicoTexto.split(",").map((s) => s.trim()).filter(Boolean);
  let duracao = 0;
  let preco = 0;
  itens.forEach((nome) => {
    const s = SERVICOS.find((x) => x.nome === nome);
    if (s) {
      duracao += s.duracao;
      preco += s.preco;
    }
  });
  return { duracao, preco };
};

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const s = status.toLowerCase();
  if (s === "confirmado") return "default";
  if (s === "concluido") return "secondary";
  if (s === "cancelado") return "destructive";
  return "outline";
};

const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

const MeusAgendamentos = () => {
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const buscar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const numeros = onlyDigits(telefone);
    if (numeros.length < 10) {
      toast.error("Digite um telefone válido");
      return;
    }

    setLoading(true);
    setBuscou(false);
    const telefoneFormatado = formatTelefone(telefone);

    const { data, error } = await (supabase as any).rpc("get_agendamentos_by_telefone", {
      p_telefone: telefoneFormatado,
    });

    const sorted = (data || []).slice().sort((a: any, b: any) => {
      if (a.data !== b.data) return a.data < b.data ? 1 : -1;
      return a.horario < b.horario ? -1 : 1;
    });

    setLoading(false);
    setBuscou(true);

    if (error) {
      toast.error("Erro ao buscar agendamentos");
      return;
    }
    setAgendamentos(sorted as any);
  };

  const hojeStr = new Date().toISOString().split("T")[0];
  const proximos = agendamentos.filter((a) => a.data >= hojeStr && a.status !== "cancelado");
  const passados = agendamentos.filter((a) => a.data < hojeStr || a.status === "cancelado");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Meus Agendamentos
          </h1>
          <p className="text-muted-foreground text-sm">
            Consulte seus agendamentos usando seu número de WhatsApp
          </p>
        </div>

        <Card className="p-4 md:p-5 mb-6 bg-card/60 border-border/60">
          <form onSubmit={buscar} className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                className="pl-10 h-11"
                aria-label="Número de telefone"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-11 px-4">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Button>
          </form>
        </Card>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        )}

        {!loading && buscou && agendamentos.length === 0 && (
          <Card className="p-8 text-center">
            <CalendarX className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Você não possui agendamentos no momento.</p>
            <Link to="/agendar" className="inline-block mt-4">
              <Button variant="outline" size="sm">Agendar agora</Button>
            </Link>
          </Card>
        )}

        {!loading && proximos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-foreground">Próximos agendamentos</h2>
            <div className="space-y-3">
              {proximos.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} />
              ))}
            </div>
          </section>
        )}

        {!loading && passados.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Histórico</h2>
            <div className="space-y-3">
              {passados.map((ag) => (
                <AgendamentoCard key={ag.id} ag={ag} muted />
              ))}
            </div>
          </section>
        )}
      </main>

      <WhatsAppButton />
    </div>
  );
};

const AgendamentoCard = ({ ag, muted }: { ag: Agendamento; muted?: boolean }) => {
  const { duracao, preco } = calcDuracaoEPreco(ag.servico);
  const statusLabel =
    ag.status === "confirmado" ? "Confirmado" :
    ag.status === "concluido" ? "Concluído" :
    ag.status === "cancelado" ? "Cancelado" :
    "Pendente";

  return (
    <Card className={`p-4 md:p-5 ${muted ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <Badge variant={statusVariant(ag.status)} className="capitalize">{statusLabel}</Badge>
        <span className="text-xs font-mono text-muted-foreground">{shortId(ag.id)}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Scissors className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span className="font-medium text-foreground">{ag.servico}</span>
        </div>
        {ag.estilo && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <span className="h-4 w-4 shrink-0" />
            <span>Estilo: {ag.estilo}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
          <span>{formatData(ag.data)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span>{ag.horario}</span>
        </div>
        {duracao > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4 text-primary shrink-0" />
            <span>{duracao} min</span>
          </div>
        )}
        {preco > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
            <span>R$ {preco.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MeusAgendamentos;
