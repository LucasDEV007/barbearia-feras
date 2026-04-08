import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SERVICOS, Servico } from "@/lib/constants";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import AgendamentoForm from "@/components/AgendamentoForm";
import ConfirmacaoDialog from "@/components/ConfirmacaoDialog";
import AppHeader from "@/components/AppHeader";
import { Scissors, Sparkles, Palette, Snowflake, Droplet, Flame, Eye } from "lucide-react";

const iconMap: Record<string, any> = {
  Scissors, Sparkles, Palette, Snowflake, Droplet, Flame, Eye,
};

const ESTILOS = ["Degradê", "Social", "Americano", "Moicano"] as const;

/** Given existing bookings with their services, compute all blocked 30-min slots */
function calcularSlotsOcupados(agendamentos: { horario: string; servico: string }[]): string[] {
  const blocked = new Set<string>();
  for (const ag of agendamentos) {
    const [h, m] = ag.horario.split(":").map(Number);
    const inicio = h * 60 + m;
    // Sum durations of all services in this booking
    const nomes = ag.servico.split(", ");
    let duracao = 0;
    for (const nome of nomes) {
      const s = SERVICOS.find((sv) => sv.nome === nome.trim());
      duracao += s ? s.duracao : 30;
    }
    // Block every 30-min slot the service spans
    for (let t = inicio; t < inicio + duracao; t += 30) {
      const hh = Math.floor(t / 60).toString().padStart(2, "0");
      const mm = (t % 60).toString().padStart(2, "0");
      blocked.add(`${hh}:${mm}`);
    }
  }
  return Array.from(blocked);
}

const Agendar = () => {
  const [searchParams] = useSearchParams();
  const estiloFromUrl = searchParams.get("estilo");
  const servicoFromUrl = searchParams.get("servico");

  const [step, setStep] = useState(1);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(
    servicoFromUrl ? [servicoFromUrl] : []
  );
  const [estilo, setEstilo] = useState<string | null>(estiloFromUrl);
  const [data, setData] = useState<Date | undefined>();
  const [horario, setHorario] = useState<string | null>(null);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmacao, setConfirmacao] = useState<{ servico: string; data: string; horario: string; nome: string; estilo?: string | null } | null>(null);

  // Computed values
  const servicosInfo = servicosSelecionados.map((nome) => SERVICOS.find((s) => s.nome === nome)!).filter(Boolean);
  const duracaoTotal = servicosInfo.reduce((acc, s) => acc + s.duracao, 0);
  const precoTotal = servicosInfo.reduce((acc, s) => acc + s.preco, 0);
  const servicoTexto = servicosSelecionados.join(", ");

  // Fetch occupied slots when date changes
  useEffect(() => {
    if (!data) return;
    const fetchOcupados = async () => {
      setLoadingSlots(true);
      const dataStr = format(data, "yyyy-MM-dd");
      const { data: agendamentos } = await supabase
        .from("agendamentos")
        .select("horario, servico")
        .eq("data", dataStr)
        .eq("status", "confirmado");
      const blocked = calcularSlotsOcupados(agendamentos || []);
      setHorariosOcupados(blocked);
      setLoadingSlots(false);
    };
    fetchOcupados();
  }, [data]);

  const toggleServico = (nome: string) => {
    setServicosSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );
  };

  const handleSubmit = async (nome: string, telefone: string, beneficioAplicado: boolean) => {
    if (servicosSelecionados.length === 0 || !data || !horario) return;
    setSubmitting(true);

    const dataStr = format(data, "yyyy-MM-dd");
    const { error } = await supabase.from("agendamentos").insert({
      nome_cliente: nome,
      telefone,
      servico: servicoTexto,
      data: dataStr,
      horario,
      estilo: estilo || null,
      beneficio_aplicado: beneficioAplicado,
    } as any).select("id").single();

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Horário indisponível", description: "Este horário acabou de ser reservado. Escolha outro.", variant: "destructive" });
        setHorariosOcupados((prev) => [...prev, horario]);
        setHorario(null);
        setStep(3);
      } else {
        toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      }
      return;
    }

    const dataFormatada = format(data, "dd/MM/yyyy");
    setConfirmacao({ servico: servicoTexto, data: dataFormatada, horario, nome, estilo });
    toast({ title: "✅ Agendamento realizado!", description: `${servicoTexto} em ${dataFormatada} às ${horario}` });
  };

  const steps = [
    { num: 1, label: "Serviço" },
    { num: 2, label: "Data" },
    { num: 3, label: "Horário" },
    { num: 4, label: "Dados" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <span>{s.num}</span>
                <span className="hidden xs:inline sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Service selection (multi) */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Escolha os serviços</h2>
            <p className="text-muted-foreground mb-6">Selecione um ou mais serviços e clique em continuar.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICOS.map((s) => {
                const selected = servicosSelecionados.includes(s.nome);
                const IconComponent = iconMap[s.icone];
                return (
                  <Card
                    key={s.nome}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      selected ? "border-primary bg-primary/10" : "bg-card border-border"
                    )}
                    onClick={() => toggleServico(s.nome)}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="text-primary">
                        {IconComponent ? <IconComponent size={28} /> : <span className="text-3xl">{s.icone}</span>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{s.nome}</h3>
                        <p className="text-sm text-muted-foreground">{s.duracao} min</p>
                      </div>
                      <span className="text-lg font-bold text-primary">R$ {s.preco}</span>
                      {selected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {servicosSelecionados.length > 0 && (
              <div className="mt-6 bg-secondary rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {servicosSelecionados.length} serviço{servicosSelecionados.length > 1 ? "s" : ""} selecionado{servicosSelecionados.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-foreground font-semibold">
                    Duração total: {duracaoTotal} min · R$ {precoTotal}
                  </p>
                </div>
                <Button onClick={() => setStep(2)}>Continuar</Button>
              </div>
            )}

            {estiloFromUrl && (
              <p className="mt-4 text-sm text-muted-foreground">
                Estilo selecionado: <span className="font-medium text-foreground">{estiloFromUrl}</span>
              </p>
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
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
            <p className="text-muted-foreground mb-1">{format(data, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(/(^|\s)\w/g, (l) => l.toUpperCase())}</p>
            <p className="text-sm text-muted-foreground mb-6">Duração total: {duracaoTotal} minutos</p>
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
              duracaoServico={duracaoTotal || 30}
            />
            <Button variant="ghost" className="mt-4" onClick={() => setStep(2)}>← Voltar</Button>
          </div>
        )}

        {/* Step 4: Form */}
        {step === 4 && data && horario && servicosSelecionados.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Seus dados</h2>
            <div className="bg-secondary rounded-lg p-4 mb-6 text-sm space-y-1">
              <p><span className="text-muted-foreground mr-2">Serviços:</span><span className="font-medium">{servicoTexto}</span></p>
              <p><span className="text-muted-foreground mr-2">Duração:</span><span className="font-medium">{duracaoTotal} min</span></p>
              <p><span className="text-muted-foreground mr-2">Valor:</span><span className="font-medium">R$ {precoTotal}</span></p>
              {estilo && <p><span className="text-muted-foreground mr-2">Estilo:</span><span className="font-medium">{estilo}</span></p>}
              <p><span className="text-muted-foreground mr-2">Data:</span><span className="font-medium">{format(data, "dd/MM/yyyy")}</span></p>
              <p><span className="text-muted-foreground mr-2">Horário:</span><span className="font-medium">{horario}</span></p>
            </div>

            {/* Estilo de corte selector */}
            <div className="mb-6 max-w-md">
              <label className="text-sm font-medium text-foreground mb-2 block">Estilo de corte (opcional)</label>
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

            <AgendamentoForm onSubmit={handleSubmit} loading={submitting} />
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
