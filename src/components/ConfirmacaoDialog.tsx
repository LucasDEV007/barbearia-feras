import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { BARBEARIA_WHATSAPP } from "@/lib/constants";

interface ConfirmacaoDialogProps {
  open: boolean;
  onClose: () => void;
  dados: {
    servico: string;
    data: string;
    horario: string;
    nome: string;
    telefone?: string;
  } | null;
}

const buildGoogleCalendarUrl = (dados: { servico: string; data: string; horario: string; nome: string }) => {
  // data is dd/MM/yyyy, horario is HH:mm
  const [dd, mm, yyyy] = dados.data.split("/");
  const [hh, min] = dados.horario.split(":");
  const startDate = `${yyyy}${mm}${dd}T${hh}${min}00`;
  // Add 30 min for end time
  const endMinutes = parseInt(min) + 30;
  const endHH = (parseInt(hh) + Math.floor(endMinutes / 60)).toString().padStart(2, "0");
  const endMM = (endMinutes % 60).toString().padStart(2, "0");
  const endDate = `${yyyy}${mm}${dd}T${endHH}${endMM}00`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Barbearia Feras - ${dados.servico}`,
    details: `Agendamento de ${dados.nome}\nServiço: ${dados.servico}`,
    dates: `${startDate}/${endDate}`,
    location: "Barbearia Feras",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildWhatsAppUrl = (dados: { servico: string; data: string; horario: string; nome: string }) => {
  const msg = `Olá! Sou ${dados.nome}.\n\nAcabei de realizar um agendamento na Barbearia Feras:\n\nServiço: ${dados.servico}\nData: ${dados.data}\nHorário: ${dados.horario}\n\nAté lá!`;
  return `https://wa.me/${BARBEARIA_WHATSAPP}?text=${encodeURIComponent(msg)}`;
};

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
        <div className="space-y-2 mt-2">
          <a href={buildWhatsAppUrl(dados)} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Button className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold">
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar confirmação pelo WhatsApp
            </Button>
          </a>
          <a href={buildGoogleCalendarUrl(dados)} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Button variant="outline" className="w-full font-semibold">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Adicionar ao Google Agenda
            </Button>
          </a>
        </div>
        <Link to="/" className="w-full">
          <Button variant="ghost" className="w-full mt-1 text-muted-foreground">Voltar ao Início</Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmacaoDialog;
