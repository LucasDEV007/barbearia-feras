import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { SERVICOS } from "@/lib/constants";
import AgendaList from "@/components/AgendaList";
import AgendaSummary from "@/components/AgendaSummary";
import ConfirmacaoDialog from "@/components/ConfirmacaoDialog";

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  status: string;
}

const AdminAgenda = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<string | null>(null);

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    const dataStr = format(date, "yyyy-MM-dd");
    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("data", dataStr)
      .order("horario", { ascending: true });
    setAgendamentos((data as Agendamento[]) || []);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  const handleCancelar = async (id: string) => {
    setCancelando(id);
    const { error } = await supabase.from("agendamentos").update({ status: "cancelado" }).eq("id", id);
    setCancelando(null);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível cancelar.", variant: "destructive" });
    } else {
      toast({ title: "Agendamento cancelado" });
      fetchAgendamentos();
    }
  };

  const handleConcluir = async (id: string) => {
    const { error } = await supabase.from("agendamentos").update({ status: "concluido" }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível concluir.", variant: "destructive" });
    } else {
      toast({ title: "Atendimento concluído! ✅" });
      fetchAgendamentos();
    }
  };

  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          Agenda — {format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              locale={ptBR}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <AgendaSummary total={agendamentos.length} confirmados={confirmados} cancelados={cancelados} />
      <AgendaList agendamentos={agendamentos} onCancelar={handleCancelar} onConcluir={handleConcluir} loading={loading} cancelando={cancelando} />
    </div>
  );
};

export default AdminAgenda;
