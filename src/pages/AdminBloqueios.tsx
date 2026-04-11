import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, CalendarOff, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { gerarHorarios } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Bloqueio {
  id: string;
  data: string;
  horario: string | null;
  motivo: string | null;
  created_at: string;
}

const AdminBloqueios = () => {
  const [datasSelecionadas, setDatasSelecionadas] = useState<Date[]>([]);
  const [modo, setModo] = useState<"dia" | "horario">("dia");
  const [dataHorario, setDataHorario] = useState<Date | undefined>();
  const [horariosSelecionados, setHorariosSelecionados] = useState<string[]>([]);
  const [motivo, setMotivo] = useState("Barbeiro ausente");
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchBloqueios = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bloqueios_agenda")
      .select("*")
      .gte("data", format(new Date(), "yyyy-MM-dd"))
      .order("data", { ascending: true });
    setBloqueios((data as Bloqueio[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBloqueios();
  }, []);

  const handleBloquearDias = async () => {
    if (datasSelecionadas.length === 0) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const inserts = datasSelecionadas.map((d) => ({
      user_id: user.id,
      data: format(d, "yyyy-MM-dd"),
      horario: null,
      motivo: motivo.trim() || "Barbeiro ausente",
    }));

    const { error } = await supabase.from("bloqueios_agenda").insert(inserts);
    setSubmitting(false);

    if (error) {
      toast({ title: "Erro ao bloquear", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Dias bloqueados com sucesso!" });
      setDatasSelecionadas([]);
      fetchBloqueios();
    }
  };

  const handleBloquearHorarios = async () => {
    if (!dataHorario || horariosSelecionados.length === 0) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const inserts = horariosSelecionados.map((h) => ({
      user_id: user.id,
      data: format(dataHorario, "yyyy-MM-dd"),
      horario: h,
      motivo: motivo.trim() || "Barbeiro ausente",
    }));

    const { error } = await supabase.from("bloqueios_agenda").insert(inserts);
    setSubmitting(false);

    if (error) {
      toast({ title: "Erro ao bloquear", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Horários bloqueados com sucesso!" });
      setHorariosSelecionados([]);
      setDataHorario(undefined);
      fetchBloqueios();
    }
  };

  const handleRemover = async (id: string) => {
    const { error } = await supabase.from("bloqueios_agenda").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bloqueio removido" });
      fetchBloqueios();
    }
  };

  const toggleHorario = (h: string) => {
    setHorariosSelecionados((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  const diaSemana = dataHorario ? dataHorario.getDay() : 1;
  const horariosDisponiveis = gerarHorarios(diaSemana);

  // Group bloqueios by date
  const bloqueiosAgrupados = bloqueios.reduce<Record<string, Bloqueio[]>>((acc, b) => {
    if (!acc[b.data]) acc[b.data] = [];
    acc[b.data].push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bloquear dias da agenda</h1>

      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={modo === "dia" ? "default" : "outline"}
          onClick={() => setModo("dia")}
          size="sm"
        >
          <CalendarOff className="h-4 w-4 mr-2" />
          Bloquear dias inteiros
        </Button>
        <Button
          variant={modo === "horario" ? "default" : "outline"}
          onClick={() => setModo("horario")}
          size="sm"
        >
          <Clock className="h-4 w-4 mr-2" />
          Bloquear horários
        </Button>
      </div>

      {modo === "dia" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione os dias para bloquear</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={datasSelecionadas}
                onSelect={(dates) => setDatasSelecionadas(dates || [])}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                locale={ptBR}
                className="rounded-lg border border-border bg-card p-3 pointer-events-auto"
              />
            </div>
            {datasSelecionadas.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {datasSelecionadas.map((d) => (
                    <Badge key={d.toISOString()} variant="secondary">
                      {format(d, "dd/MM/yyyy")}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ex: Feriado, Viagem..."
                    className="bg-secondary border-border"
                  />
                </div>
                <Button onClick={handleBloquearDias} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Bloquear {datasSelecionadas.length} {datasSelecionadas.length === 1 ? "dia" : "dias"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {modo === "horario" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione o dia e os horários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={dataHorario}
                onSelect={(d) => { setDataHorario(d); setHorariosSelecionados([]); }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                locale={ptBR}
                className="rounded-lg border border-border bg-card p-3 pointer-events-auto"
              />
            </div>
            {dataHorario && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Toque nos horários que deseja bloquear em {format(dataHorario, "dd/MM/yyyy")}:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {horariosDisponiveis.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHorario(h)}
                      className={cn(
                        "px-2 py-2 rounded-lg text-sm font-medium border transition-colors",
                        horariosSelecionados.includes(h)
                          ? "bg-destructive text-destructive-foreground border-destructive"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {horariosSelecionados.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-2 max-w-sm">
                      <Label>Motivo (opcional)</Label>
                      <Input
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ex: Compromisso pessoal..."
                        className="bg-secondary border-border"
                      />
                    </div>
                    <Button onClick={handleBloquearHorarios} disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Bloquear {horariosSelecionados.length} {horariosSelecionados.length === 1 ? "horário" : "horários"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active blocks list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bloqueios ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          ) : Object.keys(bloqueiosAgrupados).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">Nenhum bloqueio ativo.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(bloqueiosAgrupados).map(([data, items]) => {
                const isDiaInteiro = items.some((b) => !b.horario);
                return (
                  <div key={data} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {format(new Date(data + "T12:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isDiaInteiro
                          ? "Dia inteiro bloqueado"
                          : `Horários: ${items.map((b) => b.horario).join(", ")}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{items[0].motivo}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        items.forEach((b) => handleRemover(b.id));
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBloqueios;
