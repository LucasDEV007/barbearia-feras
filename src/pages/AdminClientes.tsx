import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, RotateCcw, Search, UserX, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SERVICOS } from "@/lib/constants";
import { format, subDays, differenceInDays } from "date-fns";
import { toast } from "@/hooks/use-toast";

const DIAS_INATIVO = 45;

interface ClienteInfo {
  nome: string;
  telefone: string;
  visitas: number;
  ultimaVisita: string;
  receita: number;
  diasSemVisita: number;
  inativo: boolean;
}

const AdminClientes = () => {
  const [clientes, setClientes] = useState<ClienteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "ativos" | "inativos">("todos");
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("agendamentos")
        .select("nome_cliente, telefone, data, servico, status")
        .in("status", ["confirmado", "concluido"])
        .order("data", { ascending: false });

      if (!data) { setLoading(false); return; }

      const precoMap: Record<string, number> = {};
      SERVICOS.forEach((s) => (precoMap[s.nome] = s.preco));

      const map = new Map<string, ClienteInfo>();
      const hoje = new Date();

      data.forEach((a) => {
        const key = a.telefone;
        const existing = map.get(key);
        if (existing) {
          existing.visitas++;
          if (a.data > existing.ultimaVisita) existing.ultimaVisita = a.data;
          existing.receita += precoMap[a.servico] || 0;
        } else {
          map.set(key, {
            nome: a.nome_cliente,
            telefone: a.telefone,
            visitas: 1,
            ultimaVisita: a.data,
            receita: precoMap[a.servico] || 0,
            diasSemVisita: 0,
            inativo: false,
          });
        }
      });

      // Calculate inactivity
      map.forEach((c) => {
        c.diasSemVisita = differenceInDays(hoje, new Date(c.ultimaVisita + "T12:00:00"));
        c.inativo = c.diasSemVisita >= DIAS_INATIVO;
      });

      setClientes(Array.from(map.values()).sort((a, b) => b.visitas - a.visitas));
      setLoading(false);
    };
    fetchData();
  }, []);

  const abrirWhatsApp = (cliente: ClienteInfo) => {
    let phone = cliente.telefone.replace(/\D/g, "");
    if (!phone.startsWith("55")) phone = "55" + phone;
    const msg = encodeURIComponent(
      `Olá ${cliente.nome}, sentimos sua falta na Barbearia Feras! Que tal agendar seu próximo corte? 😃`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const trinta = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const ativos = clientes.filter((c) => !c.inativo).length;
  const inativos = clientes.filter((c) => c.inativo).length;
  const novos = clientes.filter((c) => c.visitas === 1).length;
  const retorno = clientes.length > 0 ? (((clientes.length - novos) / clientes.length) * 100).toFixed(0) : "0";

  const filtered = clientes
    .filter((c) => {
      if (filtro === "ativos") return !c.inativo;
      if (filtro === "inativos") return c.inativo;
      return true;
    })
    .filter(
      (c) =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.telefone.includes(busca)
    );

  const kpis = [
    { label: "Total", value: clientes.length, icon: Users, color: "text-primary" },
    { label: "Ativos", value: ativos, icon: Users, color: "text-success" },
    { label: "Inativos (45d+)", value: inativos, icon: UserX, color: "text-destructive" },
    { label: "Taxa de Retorno", value: `${retorno}%`, icon: RotateCcw, color: "text-primary" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Clientes</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "ativos", "inativos"] as const).map((f) => (
            <Button
              key={f}
              variant={filtro === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary">Cliente</TableHead>
                <TableHead className="text-primary">Telefone</TableHead>
                <TableHead className="text-primary">Visitas</TableHead>
                <TableHead className="text-primary">Última Visita</TableHead>
                <TableHead className="text-primary">Status</TableHead>
                <TableHead className="text-primary text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.telefone} className="border-border">
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{c.telefone}</TableCell>
                  <TableCell>{c.visitas}</TableCell>
                  <TableCell>
                    {format(new Date(c.ultimaVisita + "T12:00:00"), "dd/MM/yyyy")}
                    <span className="text-xs text-muted-foreground ml-1">({c.diasSemVisita}d)</span>
                  </TableCell>
                  <TableCell>
                    {c.inativo ? (
                      <Badge variant="destructive" className="text-xs">Inativo</Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground text-xs">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.inativo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => enviarPromocao(c)}
                        disabled={enviando === c.telefone}
                        className="text-xs"
                      >
                        {enviando === c.telefone ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <MessageCircle className="h-3 w-3 mr-1" />
                        )}
                        Enviar promoção
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminClientes;
