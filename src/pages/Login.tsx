import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Scissors } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BARBEARIA_NOME } from "@/lib/constants";
import AppHeader from "@/components/AppHeader";

const Login = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/admin", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin", { replace: true });
    });

    // Verifica se já existe barbeiro cadastrado
    supabase.functions.invoke("setup-barbeiro", { method: "GET" })
      .then(({ data, error }) => {
        if (!error && data && data.exists === false) setNeedsSetup(true);
      })
      .finally(() => setChecking(false));

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro no login", description: "Email ou senha inválidos.", variant: "destructive" });
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("setup-barbeiro", {
      body: { nome, email, password },
    });
    if (error || (data && data.error)) {
      setLoading(false);
      toast({
        title: "Erro ao cadastrar",
        description: (data && data.error) || "Não foi possível criar a conta.",
        variant: "destructive",
      });
      return;
    }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInErr) {
      toast({ title: "Conta criada", description: "Faça login com seus dados." });
      setNeedsSetup(false);
    } else {
      toast({ title: "Bem-vindo!", description: "Conta de barbeiro criada com sucesso." });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm bg-card border-border">
          <CardHeader className="text-center">
            <Scissors className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-primary text-2xl">{BARBEARIA_NOME}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {needsSetup ? "Criar conta do barbeiro" : "Área do Barbeiro"}
            </p>
          </CardHeader>
          <CardContent>
            {checking ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
              </div>
            ) : needsSetup ? (
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-secondary border-border" />
                </div>
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Criando...</> : "Criar conta"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Esta será a única conta de barbeiro do sistema.
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary border-border" />
                </div>
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Entrando...</> : "Entrar"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
