import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Clock, DollarSign } from "lucide-react";

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

const AdminServicos = () => {
  const { toast } = useToast();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState({ nome: "", preco: "", duracao: "", descricao: "" });
  const [saving, setSaving] = useState(false);

  const fetchServicos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar serviços", description: error.message, variant: "destructive" });
    } else {
      setServicos((data ?? []) as Servico[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const openEdit = (s: Servico) => {
    setEditing(s);
    setForm({
      nome: s.nome,
      preco: String(s.preco),
      duracao: String(s.duracao),
      descricao: s.descricao ?? "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({ nome: "", preco: "", duracao: "", descricao: "" });
  };

  const handleSave = async () => {
    if (!editing) return;
    const nome = form.nome.trim();
    const preco = Number(form.preco);
    const duracao = Number(form.duracao);
    const descricao = form.descricao.trim();

    if (!nome) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (Number.isNaN(preco) || preco < 0) {
      toast({ title: "Preço inválido", variant: "destructive" });
      return;
    }
    if (!Number.isInteger(duracao) || duracao <= 0) {
      toast({ title: "Duração inválida", description: "Informe minutos (inteiro positivo).", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("servicos")
      .update({ nome, preco, duracao, descricao })
      .eq("id", editing.id);
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }

    setServicos((prev) =>
      prev.map((s) => (s.id === editing.id ? { ...s, nome, preco, duracao, descricao } : s)),
    );
    toast({ title: "Serviço atualizado" });
    closeEdit();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Serviços
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os serviços oferecidos pela barbearia.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {servicos.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{s.nome}</CardTitle>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      R$ {Number(s.preco).toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.duracao} min
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
              </CardHeader>
              {s.descricao && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{s.descricao}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar serviço</DialogTitle>
            <DialogDescription>Altere os dados e salve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="srv-nome">Nome</Label>
              <Input
                id="srv-nome"
                value={form.nome}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="srv-preco">Preço (R$)</Label>
                <Input
                  id="srv-preco"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-duracao">Duração (min)</Label>
                <Input
                  id="srv-duracao"
                  type="number"
                  min="1"
                  step="1"
                  value={form.duracao}
                  onChange={(e) => setForm((f) => ({ ...f, duracao: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-desc">Descrição</Label>
              <Textarea
                id="srv-desc"
                rows={4}
                maxLength={500}
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServicos;