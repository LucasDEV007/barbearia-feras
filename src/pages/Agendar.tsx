import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Check, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SERVICOS, Servico } from "@/lib/constants";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import ConfirmacaoDialog from "@/components/ConfirmacaoDialog";
import AppHeader from "@/components/AppHeader";
import { Scissors, Sparkles, Palette, Snowflake, Droplet, Flame, Eye } from "lucide-react";

const iconMap: Record<string, any> = {
  Scissors, Sparkles, Palette, Snowflake, Droplet, Flame, Eye,
};

const ESTILOS = ["Degradê", "Social", "Americano", "Moicano"] as const;

interface PessoaAgendamento {
  nome: string;
  servicos: string[];
  estilo: string | null;
}

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

function calcDuracaoPessoa(servicos: string[]): number {
  return servicos.reduce((acc, nome) => {
    const s = SERVICOS.find((sv) => sv.nome === nome);
    return acc + (s ? s.duracao : 30);
  }, 0);
}

function calcPrecoPessoa(servicos: string[]): number {
  return servicos.reduce((acc, nome) => {
    const s = SERVICOS.find((sv) => sv.nome === nome);
    return acc + (s ? s.preco : 0);
  }, 0);
}

const Agendar = () => {
  const [searchParams] = useSearchParams();
  const estiloFromUrl = searchParams.get("estilo");
  const servicoFromUrl = searchParams.get("servico");

  const [step, setStep] = useState(servicoFromUrl ? 2 : 1);
  const [numPessoas, setNumPessoas] = useState(1);
  const [pessoas, setPessoas] = useState<PessoaAgendamento[]>([
    { nome: "", servicos: servicoFromUrl ? [servicoFromUrl] : [], estilo: estiloFromUrl || null },
  ]);
  const [pessoaAtual, setPessoaAtual] = useState(0);
  const [data, setData] = useState<Date | undefined>();
  const [horario, setHorario] = useState<string | null>(null);
  const [telefone, setTelefone] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmacao, setConfirmacao] = useState<any>(null);

  // Computed
  const duracaoTotal = pessoas.reduce((acc, p) => acc + calcDuracaoPessoa(p.servicos), 0);
  const precoTotal = pessoas.reduce((acc, p) => acc + calcPrecoPessoa(p.servicos), 0);

  // Fetch occupied slots
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
      setHorariosOcupados(calcularSlotsOcupados(agendamentos || []));
      setLoadingSlots(false);
    };
    fetchOcupados();
  }, [data]);

  const handleSelectNumPessoas = (n: number) => {
    setNumPessoas(n);
    const newPessoas: PessoaAgendamento[] = Array.from({ length: n }, (_, i) =>
      pessoas[i] || { nome: "", servicos: [], estilo: null }
    );
    setPessoas(newPessoas);
    setPessoaAtual(0);
    setStep(2);
  };

  const toggleServicoPessoa = (pessoaIdx: number, servicoNome: string) => {
    setPessoas((prev) => {
      const updated = [...prev];
      const p = { ...updated[pessoaIdx] };
      p.servicos = p.servicos.includes(servicoNome)
        ? p.servicos.filter((s) => s !== servicoNome)
        : [...p.servicos, servicoNome];
      updated[pessoaIdx] = p;
      return updated;
    });
  };

  const todasPessoasTemServico = pessoas.every((p) => p.servicos.length > 0);

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async () => {
    if (!data || !horario || !telefone.trim()) return;
    if (pessoas.some((p) => !p.nome.trim() || p.servicos.length === 0)) return;
    setSubmitting(true);

    const dataStr = format(data, "yyyy-MM-dd");
    let hasError = false;

    for (const p of pessoas) {
      const servicoTexto = p.servicos.join(", ");
      const { error } = await supabase.from("agendamentos").insert({
        nome_cliente: p.nome.trim(),
        telefone: telefone.trim(),
        servico: servicoTexto,
        data: dataStr,
        horario,
        estilo: p.estilo || null,
        beneficio_aplicado: false,
      });
      console.log("Insert result for", p.nome, ":", error ? error.message : "OK");

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Horário indisponível", description: "Este horário acabou de ser reservado.", variant: "destructive" });
          setHorariosOcupados((prev) => [...prev, horario]);
          setHorario(null);
          setStep(4);
        } else {
          toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
        }
        hasError = true;
        break;
      }
    }

    setSubmitting(false);
    if (hasError) return;

    const dataFormatada = format(data, "dd/MM/yyyy");
    const nomesResumo = pessoas.map((p) => p.nome.trim()).join(", ");
    const servicosResumo = pessoas.map((p) => `${p.nome.trim()}: ${p.servicos.join(", ")}`).join(" | ");
    setConfirmacao({
      servico: servicosResumo,
      data: dataFormatada,
      horario,
      nome: nomesResumo,
      estilo: null,
    });
    toast({ title: "✅ Agendamento realizado!", description: `${numPessoas} pessoa${numPessoas > 1 ? "s" : ""} agendada${numPessoas > 1 ? "s" : ""} para ${dataFormatada} às ${horario}` });
  };

  const stepLabels = [
    { num: 1, label: "Pessoas" },
    { num: 2, label: "Serviços" },
    { num: 3, label: "Data" },
    { num: 4, label: "Horário" },
    { num: 5, label: "Dados" },
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

        {/* Step 1: Number of people */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quantas pessoas serão atendidas?</h2>
            <p className="text-muted-foreground mb-6">Selecione a quantidade de pessoas para o atendimento.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <Card
                  key={n}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    numPessoas === n && step > 1 ? "border-primary bg-primary/10" : "bg-card border-border"
                  )}
                  onClick={() => handleSelectNumPessoas(n)}
                >
                  <CardContent className="p-6 flex flex-col items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <span className="text-lg font-bold text-foreground">{n}</span>
                    <span className="text-sm text-muted-foreground">
                      {n === 1 ? "pessoa" : "pessoas"}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Services per person */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {numPessoas > 1
                ? `Escolha os serviços — Pessoa ${pessoaAtual + 1} de ${numPessoas}`
                : "Escolha os serviços"}
            </h2>
            <p className="text-muted-foreground mb-6">Selecione um ou mais serviços{numPessoas > 1 ? ` para a pessoa ${pessoaAtual + 1}` : ""}.</p>

            {/* Person tabs if multiple */}
            {numPessoas > 1 && (
              <div className="flex gap-2 mb-6">
                {pessoas.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPessoaAtual(i)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                      pessoaAtual === i
                        ? "bg-primary text-primary-foreground border-primary"
                        : p.servicos.length > 0
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    Pessoa {i + 1}
                    {p.servicos.length > 0 && <Check className="inline h-3 w-3 ml-1" />}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICOS.map((s) => {
                const selected = pessoas[pessoaAtual].servicos.includes(s.nome);
                const IconComponent = iconMap[s.icone];
                return (
                  <Card
                    key={s.nome}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      selected ? "border-primary bg-primary/10" : "bg-card border-border"
                    )}
                    onClick={() => toggleServicoPessoa(pessoaAtual, s.nome)}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="text-primary">
                        {IconComponent ? <IconComponent size={28} /> : <span className="text-3xl">{s.icone}</span>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{s.nome}</h3>
                        <p className="text-xs text-muted-foreground">{s.descricao}</p>
                        <p className="text-sm text-muted-foreground mt-1">{s.duracao} min</p>
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

            {/* Summary bar */}
            {todasPessoasTemServico && (
              <div className="mt-6 bg-secondary rounded-lg p-4">
                {numPessoas > 1 && (
                  <div className="space-y-1 mb-3 text-sm">
                    {pessoas.map((p, i) => (
                      <p key={i} className="text-muted-foreground">
                        <span className="font-medium text-foreground">Pessoa {i + 1}:</span>{" "}
                        {p.servicos.join(", ")} ({calcDuracaoPessoa(p.servicos)} min — R$ {calcPrecoPessoa(p.servicos)})
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-semibold">
                      Duração total: {duracaoTotal} min · R$ {precoTotal}
                    </p>
                  </div>
                  <Button onClick={() => setStep(3)}>Continuar</Button>
                </div>
              </div>
            )}

            <Button variant="ghost" className="mt-4" onClick={() => { setStep(1); }}>← Voltar</Button>
          </div>
        )}

        {/* Step 3: Date */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Escolha a data</h2>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={data}
                onSelect={(d) => { setData(d); if (d) { setHorario(null); setStep(4); } }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                locale={ptBR}
                className="rounded-lg border border-border bg-card p-3 pointer-events-auto"
              />
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => setStep(2)}>← Voltar</Button>
          </div>
        )}

        {/* Step 4: Time */}
        {step === 4 && data && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o horário</h2>
            <p className="text-muted-foreground mb-1">
              {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(/^./, (l) => l.toUpperCase())}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Duração total: {duracaoTotal} minutos{numPessoas > 1 ? ` (${numPessoas} pessoas)` : ""}
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
              onSelect={(h) => { setHorario(h); setStep(5); }}
              loading={loadingSlots}
              dataSelecionada={data}
              duracaoServico={duracaoTotal || 30}
            />
            <Button variant="ghost" className="mt-4" onClick={() => setStep(3)}>← Voltar</Button>
          </div>
        )}

        {/* Step 5: Names + phone + summary */}
        {step === 5 && data && horario && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Seus dados</h2>

            {/* Summary */}
            <div className="bg-secondary rounded-lg p-4 mb-6 text-sm space-y-2">
              {pessoas.map((p, i) => (
                <div key={i} className="border-b border-border pb-2 last:border-0 last:pb-0">
                  <p className="font-medium text-foreground">
                    {numPessoas > 1 ? `Pessoa ${i + 1}` : "Serviços"}
                  </p>
                  <p className="text-muted-foreground">
                    {p.servicos.join(", ")} — {calcDuracaoPessoa(p.servicos)} min · R$ {calcPrecoPessoa(p.servicos)}
                  </p>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <p><span className="text-muted-foreground mr-2">Total:</span><span className="font-bold text-foreground">{duracaoTotal} min · R$ {precoTotal}</span></p>
                <p><span className="text-muted-foreground mr-2">Data:</span><span className="font-medium">{format(data, "dd/MM/yyyy")}</span></p>
                <p><span className="text-muted-foreground mr-2">Horário:</span><span className="font-medium">{horario}</span></p>
              </div>
            </div>

            {/* Names for each person */}
            <div className="space-y-4 max-w-md mb-6">
              {pessoas.map((p, i) => (
                <div key={i} className="space-y-2">
                  <Label htmlFor={`nome-${i}`}>
                    {numPessoas > 1 ? `Nome — Pessoa ${i + 1}` : "Nome completo"}
                  </Label>
                  <Input
                    id={`nome-${i}`}
                    placeholder="Nome completo"
                    value={p.nome}
                    onChange={(e) => {
                      setPessoas((prev) => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], nome: e.target.value };
                        return updated;
                      });
                    }}
                    required
                    className="bg-secondary border-border"
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone para contato</Label>
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

            {/* Estilo selector for each person */}
            {pessoas.map((p, i) => (
              <div key={i} className="mb-4 max-w-md">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Estilo de corte{numPessoas > 1 ? ` — Pessoa ${i + 1}` : ""} (opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ESTILOS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setPessoas((prev) => {
                          const updated = [...prev];
                          updated[i] = { ...updated[i], estilo: updated[i].estilo === e ? null : e };
                          return updated;
                        });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                        p.estilo === e
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={submitting || !telefone.trim() || pessoas.some((p) => !p.nome.trim())}
              className="w-full max-w-md font-semibold"
            >
              {submitting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Agendando...</> : "Confirmar Agendamento"}
            </Button>
            <Button variant="ghost" className="mt-4" onClick={() => setStep(4)}>← Voltar</Button>
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
