import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminConfiguracoes = () => {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setCurrentEmail(user.email);
        setNewEmail(user.email);
      }
    });
  }, []);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail === currentEmail) {
      toast({ title: "Nada a alterar", description: "O email é o mesmo." });
      return;
    }
    setLoadingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoadingEmail(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Email atualizado",
        description: "Verifique sua caixa de entrada para confirmar a alteração.",
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Senha curta", description: "Mínimo de 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas diferentes", description: "Confirmação não confere.", variant: "destructive" });
      return;
    }
    setLoadingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoadingPassword(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Senha atualizada", description: "Sua nova senha já está ativa." });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações da conta</h1>
        <p className="text-sm text-muted-foreground">Atualize seu email e senha de acesso.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" /> Alterar email
          </CardTitle>
          <CardDescription>Um link de confirmação será enviado para o novo endereço.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentEmail">Email atual</Label>
              <Input id="currentEmail" value={currentEmail} disabled className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Novo email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="bg-secondary"
              />
            </div>
            <Button type="submit" disabled={loadingEmail}>
              {loadingEmail ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Salvando...</> : "Salvar email"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" /> Alterar senha
          </CardTitle>
          <CardDescription>Escolha uma senha forte com pelo menos 6 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-secondary"
              />
            </div>
            <Button type="submit" disabled={loadingPassword}>
              {loadingPassword ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Salvando...</> : "Salvar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConfiguracoes;
