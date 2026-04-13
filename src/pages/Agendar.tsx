import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SERVICOS } from "@/lib/constants";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import ConfirmacaoDialog from "@/components/ConfirmacaoDialog";
import AppHeader from "@/components/AppHeader";
import { Scissors, Sparkles, Palette, Snowflake, Droplet, Flame, Eye } from "lucide-react";

const iconMap: Record<string, any> = {
  Scissors, Sparkles, Palette, Snowflake, Droplet, Flame, Eye,
};

const ESTILOS = ["Degradê", "Social", "Americano", "Moicano"] as const;

type ServicoQuantidades = Record<string, number>;

function calcularSlotsOcupados(agendamentos: { horario: string; servico: string }[]): string[] {
  const blocked = new Set<string>();
  for (const ag of agendamentos) {
    const [h, m] = ag.horario.split(":").map(Number);
    const inicio = h * 60 + m;
    const nomes = ag.servico.split(", ");
    let duracao = 0;
    for (const nome of nomes) {
      const s = SERVICOS.find((sv) => sv.nome === nome.trim());
      duracao += s ? s.duracao : 30;
    }
    for (let t = inicio; t < inicio + duracao; t += 30) {
      const hh = Math.floor(t / 60).toString().padStart(2, "0");
      const mm = (t % 60).toString().padStart(2, "0");
      blocked.add(`${hh}:${mm}`);
    }
  }
  return Array.from(blocked);
}

function calcDuracaoTotal(qtds: ServicoQuantidades): number {
  return Object.entries(qtds).reduce((acc, [nome, qty]) => {
    const s = SERVICOS.find((sv) => sv.nome === nome);
    return acc + (s ? s.duracao * qty : 0);
  }, 0);
}

function calcPrecoTotal(qtds: ServicoQuantidades): number {
  return Object.entries(qtds).reduce((acc, [nome, qty]) => {
    const s = SERVICOS.find((sv) => sv.nome === nome);
    return acc + (s ? s.preco * qty : 0);
  }, 0);
}

function buildServicoTexto(qtds: ServicoQuantidades): string {
  const parts: string[] = [];
  for (const [nome, qty] of Object.entries(qtds)) {
    for (let i = 0; i < qty; i++) parts.push(nome);
  }
  return parts.join(", ");
}

const Agendar = () => {
  const [searchParams] = useSearchParams();
  const estiloFromUrl = searchParams.get("estilo");
  const servicoFromUrl = searchParams.get("servico");

  const [step, setStep] = useState(1);
  // Step 1: just selected service names
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(
    servicoFromUrl ? [servicoFromUrl] : estiloFromUrl ? ["Corte masculino"] : []
  );
  // Step 4: quantities per selected service (default 1)
  const [quantidades, setQuantidades] = useState<ServicoQuantidades>({});
  const [data, setData] = useState<Date | undefined>();
  const [horario, setHorario] = useState<string | null>(null);
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([]);
  const [horariosBloqueados, setHorariosBloqueados] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [estilo, setEstilo] = useState<string | null>(estiloFromUrl || null);
  // numeroPessoas removed — quantities are now per-service
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmacao, setConfirmacao] = useState<any>(null);

  const temServico = servicosSelecionados.length > 0;

  // Sync quantidades when services change (default qty 1 for new services)
  useEffect(() => {
    setQuantidades((prev) => {
      const updated: ServicoQuantidades = {};
      for (const nome of servicosSelecionados) {
        updated[nome] = prev[nome] || 1;
      }
      return updated;
    });
  }, [servicosSelecionados]);

  const duracaoTotal = calcDuracaoTotal(quantidades);
  const precoTotal = calcPrecoTotal(quantidades);

  // For step 3: compute duration based on selected services (qty=1 each) for slot availability
  const duracaoParaSlots = step < 4
    ? servicosSelecionados.reduce((acc, nome) => {
        const s = SERVICOS.find((sv) => sv.nome === nome);
        return acc + (s ? s.duracao : 30);
      }, 0)
    : duracaoTotal;

  // Fetch bloqueios once
  useEffect(() => {
    const fetchBloqueios = async () => {
      const { data: bloqs } = await supabase
        .from("bloqueios_agenda")
        .select("data, horario")
        .gte("data", format(new Date(), "yyyy-MM-dd"));
      if (bloqs) {
        const dias = bloqs.filter((b: any) => !b.horario).map((b: any) => b.data);
        setDiasBloqueados([...new Set(dias)]);
      }
    };
    fetchBloqueios();
  }, []);

  // Fetch occupied + blocked slots for selected date
  useEffect(() => {
    if (!data) return;
    const fetchOcupados = async () => {
      setLoadingSlots(true);
      const dataStr = format(data, "yyyy-MM-dd");
      
      const [{ data: agendamentos }, { data: bloqs }] = await Promise.all([
        supabase.from("agendamentos").select("horario, servico").eq("data", dataStr).eq("status", "confirmado"),
        supabase.from("bloqueios_agenda").select("horario").eq("data", dataStr),
      ]);
      
      const blockedSlots = (bloqs || []).filter((b: any) => b.horario).map((b: any) => b.horario);
      setHorariosBloqueados(blockedSlots);
      setHorariosOcupados([...calcularSlotsOcupados(agendamentos || []), ...blockedSlots]);
      setLoadingSlots(false);
    };
    fetchOcupados();
  }, [data]);

  const toggleServico = (nome: string) => {
    setServicosSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );
  };


  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async () => {
    if (!data || !horario || !nome.trim() || !telefone.trim() || !temServico) return;
    setSubmitting(true);

    const dataStr = format(data, "yyyy-MM-dd");
    const servicoTexto = buildServicoTexto(quantidades);

    const { error } = await supabase.from("agendamentos").insert({
      nome_cliente: nome.trim(),
      telefone: telefone.trim(),
      servico: servicoTexto,
      data: dataStr,
      horario,
      estilo: estilo || null,
      beneficio_aplicado: false,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Horário indisponível", description: "Este horário acabou de ser reservado.", variant: "destructive" });
        setHorariosOcupados((prev) => [...prev, horario]);
        setHorario(null);
        setStep(3);
      } else {
        toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      }
      return;
    }

    const dataFormatada = format(data, "dd/MM/yyyy");
    const resumoServicos = Object.entries(quantidades)
      .map(([n, q]) => (q > 1 ? `${q}× ${n}` : n))
      .join(", ");

    setConfirmacao({
      servico: resumoServicos,
      data: dataFormatada,
      horario,
      nome: nome.trim(),
      estilo,
    });
    toast({
      title: "✅ Agendamento realizado!",
      description: `Agendado para ${dataFormatada} às ${horario}`,
    });
  };

  const stepLabels = [
    { num: 1, label: "Serviços" },
    { num: 2, label: "Data" },
    { num: 3, label: "Horário" },
    { num: 4, label: "Confirmar" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {stepLabels.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <span>{s.num}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < stepLabels.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select services (simple toggle) */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Escolha os serviços</h2>
            <p className="text-muted-foreground mb-6">Toque nos serviços desejados para selecioná-los.</p>

            <div className="grid grid-cols-1 gap-3">
              {SERVICOS.map((s) => {
                const selected = servicosSelecionados.includes(s.nome);
                const IconComponent = iconMap[s.icone];
                return (
                  <Card
                    key={s.nome}
                    onClick={() => toggleServico(s.nome)}
                    className={cn(
                      "transition-all cursor-pointer relative",
                      selected ? "border-primary bg-primary/10" : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-primary">
                          {IconComponent ? <IconComponent size={24} /> : <span className="text-2xl">{s.icone}</span>}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{s.nome}</h3>
                          <p className="text-sm text-muted-foreground">{s.duracao} min</p>
                        </div>
                        <span className="text-primary font-bold text-lg">R$ {s.preco}</span>
                        {selected && (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {temServico && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Continuar ({servicosSelecionados.length} {servicosSelecionados.length === 1 ? "serviço" : "serviços"})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Escolha a data</h2>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={data}
                onSelect={(d) => { setData(d); if (d) { setHorario(null); setStep(3); } }}
                disabled={(date) => {
                  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                  return diasBloqueados.includes(format(date, "yyyy-MM-dd"));
                }}
                locale={ptBR}
                className="rounded-lg border border-border bg-card p-3 pointer-events-auto"
              />
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => setStep(1)}>← Voltar</Button>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && data && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o horário</h2>
            <p className="text-muted-foreground mb-1">
              {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(/^./, (l) => l.toUpperCase())}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Duração estimada: {duracaoParaSlots} minutos
            </p>
            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-card border border-border" />
                <span className="text-muted-foreground">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30" />
                <span className="text-muted-foreground">Ocupado</span>
              </div>
            </div>
            <TimeSlotGrid
              horariosOcupados={horariosOcupados}
              horarioSelecionado={horario}
              onSelect={(h) => { setHorario(h); setStep(4); }}
              loading={loadingSlots}
              dataSelecionada={data}
              duracaoServico={duracaoParaSlots || 30}
            />
            <Button variant="ghost" className="mt-4" onClick={() => setStep(2)}>← Voltar</Button>
          </div>
        )}

        {/* Step 4: Quantities + Contact info + Confirm */}
        {step === 4 && data && horario && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Seus dados</h2>

            {/* Summary box */}
            <div className="bg-secondary rounded-lg p-4 mb-6 text-sm space-y-1 max-w-md">
              <p>
                <span className="text-muted-foreground mr-2">Serviços:</span>
                <span className="font-medium text-foreground">
                  {Object.entries(quantidades).map(([n, q]) => q > 1 ? `${q}× ${n}` : n).join(", ")}
                </span>
              </p>
              <p><span className="text-muted-foreground mr-2">Duração:</span><span className="font-medium text-foreground">{duracaoTotal} min</span></p>
              <p><span className="text-muted-foreground mr-2">Valor:</span><span className="font-medium text-foreground">R$ {precoTotal}</span></p>
              <p><span className="text-muted-foreground mr-2">Data:</span><span className="font-medium text-foreground">{format(data, "dd/MM/yyyy")}</span></p>
              <p><span className="text-muted-foreground mr-2">Horário:</span><span className="font-medium text-foreground">{horario}</span></p>
            </div>

            {/* Estilo selector */}
            <div className="mb-6 max-w-md">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Estilo de corte (opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {ESTILOS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEstilo(estilo === e ? null : e)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      estilo === e
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="space-y-4 max-w-md mb-6">
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
                  placeholder="(85) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  required
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !nome.trim() || !telefone.trim()}
              className="w-full max-w-md font-semibold"
            >
              {submitting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Agendando...</> : "Confirmar Agendamento"}
            </Button>
            <Button variant="ghost" className="mt-4" onClick={() => setStep(3)}>← Voltar</Button>
          </div>
        )}
      </div>

      <ConfirmacaoDialog
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        dados={confirmacao}
      />
    </div>
  );
};

export default Agendar;
