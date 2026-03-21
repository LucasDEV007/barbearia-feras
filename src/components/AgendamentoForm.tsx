import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AgendamentoFormProps {
  onSubmit: (nome: string, telefone: string) => void;
  loading?: boolean;
}

const AgendamentoForm = ({ onSubmit, loading }: AgendamentoFormProps) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim() && telefone.trim()) {
      onSubmit(nome.trim(), telefone.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input
          id="nome"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="bg-secondary border-border"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          required
          className="bg-secondary border-border"
        />
      </div>
      <Button type="submit" disabled={loading || !nome.trim() || !telefone.trim()} className="w-full font-semibold">
        {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Agendando...</> : "Confirmar Agendamento"}
      </Button>
    </form>
  );
};

export default AgendamentoForm;
