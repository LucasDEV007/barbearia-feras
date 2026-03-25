import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, X, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  status: string;
}

interface AgendaListProps {
  agendamentos: Agendamento[];
  onCancelar: (id: string) => void;
  onConcluir?: (id: string) => void;
  loading?: boolean;
  cancelando?: string | null;
}

const AgendaList = ({ agendamentos, onCancelar, onConcluir, loading, cancelando }: AgendaListProps) => {
  const copiarTelefone = (telefone: string) => {
    navigator.clipboard.writeText(telefone);
    toast({ title: "Telefone copiado!", description: telefone });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum agendamento encontrado para esta data.
      </div>
    );
  }

  // Sort by horario
  const sorted = [...agendamentos].sort((a, b) => a.horario.localeCompare(b.horario));

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-primary">Horário</TableHead>
            <TableHead className="text-primary">Cliente</TableHead>
            <TableHead className="text-primary">Telefone</TableHead>
            <TableHead className="text-primary">Serviço</TableHead>
            <TableHead className="text-primary">Status</TableHead>
            <TableHead className="text-primary text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((ag) => (
            <TableRow key={ag.id} className="border-border">
              <TableCell className="font-medium">{ag.horario}</TableCell>
              <TableCell>{ag.nome_cliente}</TableCell>
              <TableCell>
                <button
                  onClick={() => copiarTelefone(ag.telefone)}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                  title="Copiar telefone"
                >
                  {ag.telefone}
                  <Copy className="h-3 w-3" />
                </button>
              </TableCell>
              <TableCell>{ag.servico}</TableCell>
              <TableCell>
                <Badge variant={ag.status === "confirmado" ? "default" : "destructive"} className={ag.status === "confirmado" ? "bg-success/20 text-success border-success/30" : ""}>
                  {ag.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {ag.status === "confirmado" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelar(ag.id)}
                    disabled={cancelando === ag.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgendaList;
