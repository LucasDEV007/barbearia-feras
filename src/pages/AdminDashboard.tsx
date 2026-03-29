import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, DollarSign, TrendingUp, XCircle } from "lucide-react";
import { SERVICOS } from "@/lib/constants";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(43,70%,53%)", "hsl(142,60%,40%)", "hsl(230,15%,55%)", "hsl(0,70%,50%)", "hsl(200,60%,50%)"];

const AdminDashboard = () => {
  const [period, setPeriod] = useState(7);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const desde = format(subDays(new Date(), period), "yyyy-MM-dd");

      const [agRes, despRes] = await Promise.all([
        supabase.from("agendamentos").select("*").gte("data", desde).order("data"),
        supabase.from("despesas" as any).select("*").gte("vencimento", desde),
      ]);

      setAgendamentos(agRes.data || []);
      setDespesas(despRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [period]);

  const hoje = format(new Date(), "yyyy-MM-dd");
  const agHoje = agendamentos.filter((a) => a.data === hoje);
  const confirmados = agHoje.filter((a) => a.status === "confirmado").length;
  const concluidos = agendamentos.filter((a) => a.status === "concluido").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;

  const precoMap: Record<string, number> = {};
  SERVICOS.forEach((s) => (precoMap[s.nome] = s.preco));

  const faturamento = agendamentos
    .filter((a) => a.status === "concluido")
    .reduce((sum, a) => sum + (precoMap[a.servico] || 0), 0);

  const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const ticketMedio = concluidos > 0 ? faturamento / concluidos : 0;

  // Chart: revenue by day
  const revenueByDay: Record<string, number> = {};
  agendamentos
    .filter((a) => a.status === "concluido")
    .forEach((a) => {
      revenueByDay[a.data] = (revenueByDay[a.data] || 0) + (precoMap[a.servico] || 0);
    });
  const revenueChart = Object.entries(revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, valor]) => ({ data: format(new Date(data + "T12:00:00"), "dd/MM"), valor }));

  // Pie: service mix
  const serviceMix: Record<string, number> = {};
  agendamentos.forEach((a) => {
    serviceMix[a.servico] = (serviceMix[a.servico] || 0) + 1;
  });
  const pieData = Object.entries(serviceMix)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: "Agendamentos Hoje", value: agHoje.length, icon: CalendarDays, color: "text-primary" },
    { label: "Concluídos", value: concluidos, icon: CheckCircle, color: "text-success" },
    { label: "Cancelados", value: cancelados, icon: XCircle, color: "text-destructive" },
    { label: "Faturamento", value: `R$ ${faturamento.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
    { label: "Ticket Médio", value: `R$ ${ticketMedio.toFixed(0)}`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <div className="flex gap-1">
          {[7, 15, 30].map((d) => (
            <Button key={d} size="sm" variant={period === d ? "default" : "outline"} onClick={() => setPeriod(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* BI Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Faturamento Bruto</p>
            <p className="text-xl font-bold text-success">R$ {faturamento.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Despesas</p>
            <p className="text-xl font-bold text-destructive">R$ {totalDespesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lucro Real</p>
            <p className={`text-xl font-bold ${(faturamento - totalDespesas) >= 0 ? "text-success" : "text-destructive"}`}>
              {(faturamento - totalDespesas) < 0 ? "- " : ""}R$ {Math.abs(faturamento - totalDespesas).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Fluxo de Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueChart}>
                  <XAxis dataKey="data" stroke="hsl(230,10%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(230,10%,55%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(230,20%,14%)", border: "1px solid hsl(230,15%,22%)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="valor" stroke="hsl(43,70%,53%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sem dados no período.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Mix de Serviços</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(230,20%,14%)", border: "1px solid hsl(230,15%,22%)", borderRadius: 8 }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sem dados no período.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
