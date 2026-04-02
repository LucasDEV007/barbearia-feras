import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Camera, Trash2, Upload, Settings, Image as ImageIcon } from "lucide-react";

const AdminCortesRecentes = () => {
  const [ativo, setAtivo] = useState(false);
  const [limite, setLimite] = useState(6);
  const [configId, setConfigId] = useState<string | null>(null);
  const [cortes, setCortes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [estilo, setEstilo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: configs } = await supabase
      .from("cortes_recentes_config")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const config = configs?.[0] || null;

    if (config) {
      setAtivo(config.ativo);
      setLimite(config.limite);
      setConfigId(config.id);
    }

    const { data: lista } = await supabase
      .from("cortes_recentes")
      .select("*")
      .order("created_at", { ascending: false });

    setCortes(lista || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveConfig = async (newAtivo: boolean, newLimite: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (configId) {
      await supabase.from("cortes_recentes_config").update({ ativo: newAtivo, limite: newLimite, updated_at: new Date().toISOString() }).eq("id", configId);
    } else {
      // Check if config already exists for this user
      const { data: existing } = await supabase.from("cortes_recentes_config").select("id").eq("user_id", user.id).limit(1).maybeSingle();
      if (existing) {
        setConfigId(existing.id);
        await supabase.from("cortes_recentes_config").update({ ativo: newAtivo, limite: newLimite, updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        const { data } = await supabase.from("cortes_recentes_config").insert({ user_id: user.id, ativo: newAtivo, limite: newLimite }).select().single();
        if (data) setConfigId(data.id);
      }
    }
    toast({ title: "Configuração salva" });
  };

  const handleToggle = async (val: boolean) => {
    setAtivo(val);
    await saveConfig(val, limite);
  };

  const handleLimite = async (val: number) => {
    setLimite(val);
    await saveConfig(ativo, val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return toast({ title: "Selecione uma foto", variant: "destructive" });
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from("cortes-fotos").upload(fileName, file);
    if (uploadErr) {
      toast({ title: "Erro ao enviar foto", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("cortes-fotos").getPublicUrl(fileName);

    await supabase.from("cortes_recentes").insert({
      user_id: user.id,
      imagem_url: urlData.publicUrl,
      estilo: estilo || null,
      descricao: descricao || null,
    });

    setFile(null);
    setPreview(null);
    setEstilo("");
    setDescricao("");
    setUploading(false);
    toast({ title: "Corte adicionado com sucesso!" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("cortes_recentes").delete().eq("id", id);
    toast({ title: "Corte removido" });
    fetchData();
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Cortes Recentes</h1>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ativar">Exibir cortes recentes no site</Label>
            <Switch id="ativar" checked={ativo} onCheckedChange={handleToggle} />
          </div>
          <div className="space-y-2">
            <Label>Quantidade de cortes exibidos</Label>
            <div className="flex gap-2">
              {[6, 9].map((n) => (
                <Button key={n} variant={limite === n ? "default" : "outline"} size="sm" onClick={() => handleLimite(n)}>
                  {n} cortes
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adicionar corte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-primary" />
            Adicionar corte realizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Foto do corte *</Label>
            <div className="mt-2">
              {preview ? (
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => { setFile(null); setPreview(null); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 rounded-lg border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Selecionar foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
          <div>
            <Label>Estilo do corte (opcional)</Label>
            <Input value={estilo} onChange={(e) => setEstilo(e.target.value)} placeholder="Ex: Degradê, Social..." className="mt-1" />
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição do corte" className="mt-1" />
          </div>
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? "Enviando..." : "Adicionar corte"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de cortes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5 text-primary" />
            Cortes cadastrados ({cortes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cortes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum corte cadastrado ainda.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cortes.map((c) => (
                <div key={c.id} className="relative group rounded-lg overflow-hidden border border-border">
                  <div className="aspect-square">
                    <img src={c.imagem_url} alt={c.estilo || "Corte"} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 bg-card">
                    {c.estilo && <p className="text-sm font-medium text-foreground truncate">{c.estilo}</p>}
                    {c.descricao && <p className="text-xs text-muted-foreground truncate">{c.descricao}</p>}
                  </div>
                  <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCortesRecentes;
