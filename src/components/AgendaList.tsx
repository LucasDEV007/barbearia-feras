import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, X, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { GOOGLE_REVIEW_LINK } from "@/lib/constants";

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

const buildReviewWhatsAppUrl = (ag: Agendamento) => {
  let phone = ag.telefone.replace(/\D/g, "");
  if (!phone.startsWith("55")) phone = "55" + phone;
  const msg = `Olá ${ag.nome_cliente}! Obrigado por escolher a Barbearia Feras.\n\nComo foi seu ${ag.servico} hoje?\n\nSe puder, deixe sua avaliação no Google:\n${GOOGLE_REVIEW_LINK}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};

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
                <Badge
                  variant={ag.status === "cancelado" ? "destructive" : "default"}
                  className={ag.status !== "cancelado" ? "bg-success/20 text-success border-success/30" : ""}
                >
                  {ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {ag.status === "confirmado" && (
                  <div className="flex gap-1 justify-end">
                    {onConcluir && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onConcluir(ag.id)}
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluir
                      </Button>
                    )}
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
                  </div>
                )}
                {ag.status === "concluido" && (
                  <a href={buildReviewWhatsAppUrl(ag)} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Enviar pedido de avaliação
                    </Button>
                  </a>
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
