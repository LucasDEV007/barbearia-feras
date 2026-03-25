import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare, Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Template {
  id: string;
  tipo: string;
  conteudo: string;
  ativo: boolean;
}

const TIPO_LABELS: Record<string, string> = {
  confirmacao: "Confirmação Imediata",
  lembrete: "Lembrete (30min antes)",
  pos_venda: "Pós-Venda / Avaliação",
};

const AdminMensagens = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Template>>>({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("mensagem_templates" as any).select("*").order("tipo");
      setTemplates((data as unknown as Template[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async (t: Template) => {
    const changes = edits[t.id];
    if (!changes) return;
    setSaving(t.id);
    const { error } = await supabase.from("mensagem_templates" as any).update(changes as any).eq("id", t.id);
    setSaving(null);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Template salvo ✅" });
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...changes } : x)));
      setEdits((prev) => { const n = { ...prev }; delete n[t.id]; return n; });
    }
  };

  const updateEdit = (id: string, field: string, value: any) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Modelos de Mensagem</h1>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modelos de Mensagem</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Personalize as mensagens enviadas via WhatsApp. Use {"{{nome}}"}, {"{{servico}}"}, {"{{data}}"}, {"{{horario}}"} como variáveis.
        </p>
      </div>

      {templates.map((t) => {
        const current = { ...t, ...edits[t.id] };
        const hasChanges = !!edits[t.id];

        return (
          <Card key={t.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                {TIPO_LABELS[t.tipo] || t.tipo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={current.conteudo}
                onChange={(e) => updateEdit(t.id, "conteudo", e.target.value)}
                rows={3}
                className="bg-secondary border-border"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={current.ativo}
                    onCheckedChange={(v) => updateEdit(t.id, "ativo", v)}
                  />
                  <Label className="text-sm text-muted-foreground">{current.ativo ? "Ativo" : "Inativo"}</Label>
                </div>
                <Button size="sm" disabled={!hasChanges || saving === t.id} onClick={() => handleSave(t)}>
                  {saving === t.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminMensagens;
