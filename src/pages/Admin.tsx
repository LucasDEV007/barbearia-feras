import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import AgendaList from "@/components/AgendaList";
import AgendaSummary from "@/components/AgendaSummary";
import AppHeader from "@/components/AppHeader";

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  status: string;
}

const Admin = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/login", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

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
    const { error } = await supabase
      .from("agendamentos")
      .update({ status: "cancelado" })
      .eq("id", id);
    setCancelando(null);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível cancelar.", variant: "destructive" });
    } else {
      toast({ title: "Agendamento cancelado" });
      fetchAgendamentos();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Date filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            Agenda — {format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </h2>
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

        {/* Summary */}
        <AgendaSummary total={agendamentos.length} confirmados={confirmados} cancelados={cancelados} />

        {/* List */}
        <AgendaList agendamentos={agendamentos} onCancelar={handleCancelar} loading={loading} cancelando={cancelando} />
      </div>
    </div>
  );
};

export default Admin;
