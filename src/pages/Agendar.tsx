import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SERVICOS, BARBEARIA_NOME } from "@/lib/constants";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import AgendamentoForm from "@/components/AgendamentoForm";
import ConfirmacaoDialog from "@/components/ConfirmacaoDialog";

const Agendar = () => {
  const [step, setStep] = useState(1);
  const [servico, setServico] = useState<string | null>(null);
  const [data, setData] = useState<Date | undefined>();
  const [horario, setHorario] = useState<string | null>(null);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmacao, setConfirmacao] = useState<{ servico: string; data: string; horario: string; nome: string } | null>(null);

  // Fetch occupied slots when date changes
  useEffect(() => {
    if (!data) return;
    const fetchOcupados = async () => {
      setLoadingSlots(true);
      const dataStr = format(data, "yyyy-MM-dd");
      const { data: agendamentos } = await supabase
        .from("agendamentos")
        .select("horario")
        .eq("data", dataStr)
        .eq("status", "confirmado");
      setHorariosOcupados(agendamentos?.map((a) => a.horario) || []);
      setLoadingSlots(false);
    };
    fetchOcupados();
  }, [data]);

  const handleSubmit = async (nome: string, telefone: string) => {
    if (!servico || !data || !horario) return;
    setSubmitting(true);

    const dataStr = format(data, "yyyy-MM-dd");
    const { error } = await supabase.from("agendamentos").insert({
      nome_cliente: nome,
      telefone,
      servico,
      data: dataStr,
      horario,
    });

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
    setConfirmacao({ servico, data: dataFormatada, horario, nome });
    toast({ title: "✅ Agendamento realizado!", description: `${servico} em ${dataFormatada} às ${horario}` });
  };

  const steps = [
    { num: 1, label: "Serviço" },
    { num: 2, label: "Data" },
    { num: 3, label: "Horário" },
    { num: 4, label: "Dados" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold text-primary">{BARBEARIA_NOME}</h1>
        </div>
      </header>

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

        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Escolha o serviço</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICOS.map((s) => (
                <Card
                  key={s.nome}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    servico === s.nome ? "border-primary bg-primary/10" : "bg-card border-border"
                  )}
                  onClick={() => { setServico(s.nome); setStep(2); }}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <span className="text-3xl">{s.icone}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{s.nome}</h3>
                      <p className="text-sm text-muted-foreground">{s.descricao}</p>
                    </div>
                    <span className="text-lg font-bold text-primary">R$ {s.preco}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0}
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
            <p className="text-muted-foreground mb-6">{format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
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
            />
            <Button variant="ghost" className="mt-4" onClick={() => setStep(2)}>← Voltar</Button>
          </div>
        )}

        {/* Step 4: Form */}
        {step === 4 && data && horario && servico && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Seus dados</h2>
            <div className="bg-secondary rounded-lg p-4 mb-6 text-sm space-y-1">
              <p><span className="text-muted-foreground">Serviço:</span> <span className="font-medium">{servico}</span></p>
              <p><span className="text-muted-foreground">Data:</span> <span className="font-medium">{format(data, "dd/MM/yyyy")}</span></p>
              <p><span className="text-muted-foreground">Horário:</span> <span className="font-medium">{horario}</span></p>
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
