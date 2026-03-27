import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5585999999999"; // número da barbearia

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vim pelo site e gostaria de informações sobre agendamento")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 font-semibold text-sm"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Fale conosco no WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
