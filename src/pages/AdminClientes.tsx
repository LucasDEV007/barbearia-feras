import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, RotateCcw, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICOS } from "@/lib/constants";
import { format, subDays } from "date-fns";

interface ClienteInfo {
  nome: string;
  telefone: string;
  visitas: number;
  ultimaVisita: string;
  receita: number;
}

const AdminClientes = () => {
  const [clientes, setClientes] = useState<ClienteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const fetch = async () => {
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
          });
        }
      });

      setClientes(Array.from(map.values()).sort((a, b) => b.visitas - a.visitas));
      setLoading(false);
    };
    fetch();
  }, []);

  const trinta = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const ativos = clientes.filter((c) => c.ultimaVisita >= trinta).length;
  const novos = clientes.filter((c) => c.visitas === 1).length;
  const retorno = clientes.length > 0 ? ((clientes.length - novos) / clientes.length * 100).toFixed(0) : "0";

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca)
  );

  const kpis = [
    { label: "Total", value: clientes.length, icon: Users },
    { label: "Ativos (30d)", value: ativos, icon: Users },
    { label: "Novos", value: novos, icon: UserPlus },
    { label: "Taxa de Retorno", value: `${retorno}%`, icon: RotateCcw },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Clientes</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <k.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
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
                <TableHead className="text-primary text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.telefone} className="border-border">
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{c.telefone}</TableCell>
                  <TableCell>{c.visitas}</TableCell>
                  <TableCell>{format(new Date(c.ultimaVisita + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-right font-medium text-primary">R$ {c.receita.toFixed(0)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
