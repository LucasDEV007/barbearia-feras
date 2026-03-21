import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ConfirmacaoDialogProps {
  open: boolean;
  onClose: () => void;
  dados: {
    servico: string;
    data: string;
    horario: string;
    nome: string;
  } | null;
}

const ConfirmacaoDialog = ({ open, onClose, dados }: ConfirmacaoDialogProps) => {
  if (!dados) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader className="items-center text-center">
          <CheckCircle className="h-16 w-16 text-primary mb-2" />
          <DialogTitle className="text-2xl text-primary">Agendamento Confirmado!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tudo certo, {dados.nome}!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 bg-secondary rounded-lg p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Serviço</span>
            <span className="font-medium text-foreground">{dados.servico}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium text-foreground">{dados.data}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Horário</span>
            <span className="font-medium text-foreground">{dados.horario}</span>
          </div>
        </div>
        <Link to="/" className="w-full">
          <Button variant="outline" className="w-full mt-2">Voltar ao Início</Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmacaoDialog;
