import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIAS = ["Aluguel", "Produtos", "Equipamentos", "Salário", "Marketing", "Outros"];

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  categoria: string;
  pago: boolean;
}

const AdminFinanceiro = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [categoria, setCategoria] = useState("Outros");
  const [pago, setPago] = useState(false);

  const fetchDespesas = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("despesas").select("*").order("vencimento", { ascending: false });
    setDespesas((data as Despesa[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDespesas(); }, [fetchDespesas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast({ title: "Erro", description: "Faça login.", variant: "destructive" }); setSubmitting(false); return; }

    const { error } = await supabase.from("despesas").insert({
      descricao,
      valor: Number(valor),
      vencimento,
      categoria,
      pago,
      user_id: session.user.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lançamento adicionado ✅" });
      setDescricao(""); setValor(""); setVencimento(""); setCategoria("Outros"); setPago(false);
      fetchDespesas();
    }
  };

  const togglePago = async (id: string, current: boolean) => {
    await supabase.from("despesas").update({ pago: !current }).eq("id", id);
    fetchDespesas();
  };

  const filtered = despesas.filter((d) => {
    if (filter === "pending") return !d.pago;
    if (filter === "paid") return d.pago;
    return true;
  });

  const totalMes = despesas.reduce((s, d) => s + Number(d.valor), 0);
  const pendente = despesas.filter((d) => !d.pago).reduce((s, d) => s + Number(d.valor), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Contas & Despesas</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">A Pagar</p>
            <p className="text-xl font-bold text-destructive">R$ {pendente.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Lançado</p>
            <p className="text-xl font-bold text-foreground">R$ {totalMes.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* New expense form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-foreground">
            <Plus className="h-4 w-4" /> Novo Lançamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label>Vencimento</Label>
              <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox id="pago" checked={pago} onCheckedChange={(v) => setPago(!!v)} />
              <Label htmlFor="pago">Já está pago?</Label>
            </div>
            <Button type="submit" disabled={submitting} className="sm:col-span-2 font-semibold">
              {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <DollarSign className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {([["all", "Tudo"], ["pending", "Pendentes"], ["paid", "Pagos"]] as const).map(([key, label]) => (
          <Button key={key} size="sm" variant={filter === key ? "default" : "outline"} onClick={() => setFilter(key)}>
            {label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary">Descrição</TableHead>
                <TableHead className="text-primary">Categoria</TableHead>
                <TableHead className="text-primary">Vencimento</TableHead>
                <TableHead className="text-primary">Valor</TableHead>
                <TableHead className="text-primary text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id} className="border-border">
                  <TableCell className="font-medium">{d.descricao}</TableCell>
                  <TableCell>{d.categoria}</TableCell>
                  <TableCell>{format(new Date(d.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                  <TableCell>R$ {Number(d.valor).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className="cursor-pointer"
                      variant={d.pago ? "default" : "destructive"}
                      onClick={() => togglePago(d.id, d.pago)}
                    >
                      {d.pago ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma despesa.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminFinanceiro;
