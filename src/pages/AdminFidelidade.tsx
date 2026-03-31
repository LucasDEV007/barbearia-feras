import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Gift, Trophy, Star, Settings, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FidelidadeConfig {
  id?: string;
  ativo: boolean;
  cortes_necessarios: number;
  beneficio: string;
  user_id?: string;
}

interface ClientePontos {
  id: string;
  telefone: string;
  nome_cliente: string;
  pontos: number;
  recompensa_disponivel: boolean;
  recompensas_utilizadas: number;
}

const AdminFidelidade = () => {
  const [config, setConfig] = useState<FidelidadeConfig>({
    ativo: false,
    cortes_necessarios: 5,
    beneficio: "1 corte gratuito",
  });
  const [clientes, setClientes] = useState<ClientePontos[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [configRes, pontosRes] = await Promise.all([
      supabase.from("fidelidade_config").select("*").limit(1).maybeSingle(),
      supabase.from("fidelidade_pontos").select("*").order("pontos", { ascending: false }),
    ]);

    if (configRes.data) {
      setConfig(configRes.data as unknown as FidelidadeConfig);
    }

    setClientes((pontosRes.data as unknown as ClientePontos[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveConfig = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      setSaving(false);
      return;
    }

    if (config.id) {
      const { error } = await supabase
        .from("fidelidade_config")
        .update({
          ativo: config.ativo,
          cortes_necessarios: config.cortes_necessarios,
          beneficio: config.beneficio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Configuração salva! ✅" });
      }
    } else {
      const { data, error } = await supabase
        .from("fidelidade_config")
        .insert({
          ativo: config.ativo,
          cortes_necessarios: config.cortes_necessarios,
          beneficio: config.beneficio,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        setConfig(data as unknown as FidelidadeConfig);
        toast({ title: "Configuração criada! ✅" });
      }
    }
    setSaving(false);
  };

  const handleResgatarRecompensa = async (cliente: ClientePontos) => {
    const { error } = await supabase
      .from("fidelidade_pontos")
      .update({
        pontos: 0,
        recompensa_disponivel: false,
        recompensas_utilizadas: cliente.recompensas_utilizadas + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cliente.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Recompensa resgatada! 🎉", description: `Pontos de ${cliente.nome_cliente} foram reiniciados.` });
      fetchData();
    }
  };

  const filtered = clientes.filter(
    (c) =>
      c.nome_cliente.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca)
  );

  const comRecompensa = clientes.filter((c) => c.recompensa_disponivel).length;
  const totalParticipantes = clientes.length;

  const kpis = [
    { label: "Participantes", value: totalParticipantes, icon: Star, color: "text-primary" },
    { label: "Recompensas Disponíveis", value: comRecompensa, icon: Gift, color: "text-success" },
    { label: "Meta de Cortes", value: config.cortes_necessarios, icon: Trophy, color: "text-primary" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Programa de Fidelidade</h1>

      {/* Config Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Ativar Programa de Fidelidade</Label>
              <p className="text-sm text-muted-foreground">
                Quando ativado, cada atendimento concluído acumula pontos para o cliente.
              </p>
            </div>
            <Switch
              checked={config.ativo}
              onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, ativo: checked }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade de cortes para recompensa</Label>
              <Input
                type="number"
                min={2}
                max={20}
                value={config.cortes_necessarios}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, cortes_necessarios: parseInt(e.target.value) || 5 }))
                }
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Benefício oferecido</Label>
              <Input
                value={config.beneficio}
                onChange={(e) => setConfig((prev) => ({ ...prev, beneficio: e.target.value }))}
                placeholder="Ex: 1 corte gratuito"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <Button onClick={handleSaveConfig} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </CardContent>
      </Card>

      {/* KPIs */}
      {config.ativo && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpis.map((k) => (
              <Card key={k.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <k.icon className={`h-4 w-4 ${k.color}`} />
                    <span className="text-xs text-muted-foreground">{k.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{k.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>

          {/* Client List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-primary">Cliente</TableHead>
                    <TableHead className="text-primary">Telefone</TableHead>
                    <TableHead className="text-primary">Progresso</TableHead>
                    <TableHead className="text-primary">Recompensas Usadas</TableHead>
                    <TableHead className="text-primary">Status</TableHead>
                    <TableHead className="text-primary text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const progresso = Math.min((c.pontos / config.cortes_necessarios) * 100, 100);
                    return (
                      <TableRow key={c.id} className="border-border">
                        <TableCell className="font-medium">{c.nome_cliente}</TableCell>
                        <TableCell>{c.telefone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Progress value={progresso} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {c.pontos} / {config.cortes_necessarios}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{c.recompensas_utilizadas}</TableCell>
                        <TableCell>
                          {c.recompensa_disponivel ? (
                            <Badge className="bg-success text-success-foreground text-xs">
                              🎁 Recompensa disponível
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Acumulando
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {c.recompensa_disponivel && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResgatarRecompensa(c)}
                              className="text-xs"
                            >
                              <Gift className="h-3 w-3 mr-1" />
                              Resgatar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {clientes.length === 0
                          ? "Nenhum cliente participando ainda. Os pontos serão registrados automaticamente ao concluir atendimentos."
                          : "Nenhum cliente encontrado."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminFidelidade;
