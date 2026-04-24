import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Clock, DollarSign, Plus, ArrowUp, ArrowDown } from "lucide-react";

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

type FormState = { nome: string; preco: string; duracao: string; descricao: string };

const emptyForm: FormState = { nome: "", preco: "", duracao: "", descricao: "" };

const AdminServicos = () => {
  const { toast } = useToast();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogMode("create");
  };

  const openEdit = (s: Servico) => {
    setEditing(s);
    setForm({
      nome: s.nome,
      preco: String(s.preco),
      duracao: String(s.duracao),
      descricao: s.descricao ?? "",
    });
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditing(null);
    setForm(emptyForm);
  };

  const validate = (): { nome: string; preco: number; duracao: number; descricao: string } | null => {
    const nome = form.nome.trim();
    const preco = Number(form.preco);
    const duracao = Number(form.duracao);
    const descricao = form.descricao.trim();

    if (!nome) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return null;
    }
    if (nome.length > 100) {
      toast({ title: "Nome muito longo", description: "Máximo 100 caracteres.", variant: "destructive" });
      return null;
    }
    if (Number.isNaN(preco) || preco <= 0) {
      toast({ title: "Preço inválido", description: "Deve ser maior que zero.", variant: "destructive" });
      return null;
    }
    if (!Number.isInteger(duracao) || duracao <= 0) {
      toast({ title: "Duração inválida", description: "Informe minutos (inteiro positivo).", variant: "destructive" });
      return null;
    }
    if (descricao.length > 200) {
      toast({ title: "Descrição muito longa", description: "Máximo 200 caracteres.", variant: "destructive" });
      return null;
    }
    // Duplicate name check (case-insensitive)
    const lower = nome.toLowerCase();
    const dup = servicos.find(
      (s) => s.nome.toLowerCase() === lower && (!editing || s.id !== editing.id),
    );
    if (dup) {
      toast({ title: "Já existe um serviço com esse nome", variant: "destructive" });
      return null;
    }
    return { nome, preco, duracao, descricao };
  };

  const handleSave = async () => {
    const valid = validate();
    if (!valid) return;

    setSaving(true);
    if (dialogMode === "edit" && editing) {
      const { error } = await supabase
        .from("servicos")
        .update({ nome: valid.nome, preco: valid.preco, duracao: valid.duracao, descricao: valid.descricao })
        .eq("id", editing.id);
      setSaving(false);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        return;
      }
      setServicos((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...valid } : s)),
      );
      toast({ title: "Serviço atualizado" });
    } else {
      // create
      const maxOrdem = servicos.reduce((max, s) => Math.max(max, s.ordem), 0);
      const { data, error } = await supabase
        .from("servicos")
        .insert({
          nome: valid.nome,
          preco: valid.preco,
          duracao: valid.duracao,
          descricao: valid.descricao,
          icone: "Scissors",
          ordem: maxOrdem + 1,
          ativo: true,
        })
        .select()
        .single();
      setSaving(false);
      if (error) {
        const isDup = error.code === "23505";
        toast({
          title: isDup ? "Já existe um serviço com esse nome" : "Erro ao criar",
          description: isDup ? undefined : error.message,
          variant: "destructive",
        });
        return;
      }
      setServicos((prev) => [...prev, data as Servico]);
      toast({ title: "Serviço criado" });
    }
    closeDialog();
  };

  const toggleAtivo = async (s: Servico) => {
    const novoAtivo = !s.ativo;
    setServicos((prev) => prev.map((x) => (x.id === s.id ? { ...x, ativo: novoAtivo } : x)));
    const { error } = await supabase
      .from("servicos")
      .update({ ativo: novoAtivo })
      .eq("id", s.id);
    if (error) {
      // revert
      setServicos((prev) => prev.map((x) => (x.id === s.id ? { ...x, ativo: s.ativo } : x)));
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: novoAtivo ? "Serviço ativado" : "Serviço desativado" });
  };

  const move = async (s: Servico, direction: "up" | "down") => {
    const idx = servicos.findIndex((x) => x.id === s.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= servicos.length) return;
    const other = servicos[swapIdx];

    setReordering(s.id);
    // optimistic swap
    const next = [...servicos];
    next[idx] = { ...other, ordem: s.ordem };
    next[swapIdx] = { ...s, ordem: other.ordem };
    setServicos(next);

    const [r1, r2] = await Promise.all([
      supabase.from("servicos").update({ ordem: other.ordem }).eq("id", s.id),
      supabase.from("servicos").update({ ordem: s.ordem }).eq("id", other.id),
    ]);
    setReordering(null);
    if (r1.error || r2.error) {
      toast({ title: "Erro ao reordenar", variant: "destructive" });
      fetchServicos();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Serviços
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os serviços oferecidos pela barbearia.
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Adicionar serviço
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : servicos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum serviço cadastrado ainda. Clique em "Adicionar serviço".
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {servicos.map((s, idx) => (
            <Card key={s.id} className={s.ativo ? "" : "opacity-60"}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">{s.nome}</CardTitle>
                    {!s.ativo && (
                      <Badge variant="outline" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </div>
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      disabled={idx === 0 || reordering === s.id}
                      onClick={() => move(s, "up")}
                      aria-label="Subir"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      disabled={idx === servicos.length - 1 || reordering === s.id}
                      onClick={() => move(s, "down")}
                      aria-label="Descer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <Switch
                      checked={s.ativo}
                      onCheckedChange={() => toggleAtivo(s)}
                      aria-label={s.ativo ? "Desativar" : "Ativar"}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Editar
                  </Button>
                </div>
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

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Adicionar serviço" : "Editar serviço"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Preencha os dados do novo serviço."
                : "Altere os dados e salve."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="srv-nome">Nome *</Label>
              <Input
                id="srv-nome"
                value={form.nome}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="srv-preco">Preço (R$) *</Label>
                <Input
                  id="srv-preco"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-duracao">Duração (min) *</Label>
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
              <Label htmlFor="srv-desc">Descrição (opcional)</Label>
              <Textarea
                id="srv-desc"
                rows={4}
                maxLength={200}
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.descricao.length}/200
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
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