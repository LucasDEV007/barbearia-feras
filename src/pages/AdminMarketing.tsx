import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, Image, RectangleVertical } from "lucide-react";
import { BARBEARIA_NOME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

type FormatType = "story" | "post";
type MessageType = "divulgacao" | "promocao" | "agenda" | "finalizado";

const MESSAGES: Record<MessageType, { titulo: string; linhas: string[] }> = {
  divulgacao: {
    titulo: "Divulgação",
    linhas: [
      "Já fez seu corte essa semana?",
      "Não? Está esperando o quê?",
      "Agende agora o seu horário.",
    ],
  },
  promocao: {
    titulo: "Promoção do dia",
    linhas: [
      "Promoção da semana.",
      "Corte + barba por preço especial.",
      "Agende agora.",
    ],
  },
  agenda: {
    titulo: "Agenda aberta",
    linhas: [
      "Agenda aberta para hoje.",
      "Garanta seu horário.",
      "Agende agora.",
    ],
  },
  finalizado: {
    titulo: "Corte finalizado",
    linhas: [
      "Mais um corte finalizado.",
      "Obrigado pela preferência.",
    ],
  },
};

const BOOKING_URL = "barbearia-feras.lovable.app";

function drawCanvas(
  canvas: HTMLCanvasElement,
  format: FormatType,
  messageType: MessageType
) {
  const w = 1080;
  const h = format === "story" ? 1920 : 1080;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d")!;
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1a1a1a");
  grad.addColorStop(0.5, "#222222");
  grad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle texture dots
  ctx.fillStyle = "rgba(255,255,255,0.015)";
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Decorative gold line top
  const lineY = format === "story" ? 320 : 200;
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, lineY);
  ctx.lineTo(w * 0.8, lineY);
  ctx.stroke();

  // Barbershop name
  const titleY = format === "story" ? 260 : 160;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 72px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(BARBEARIA_NOME.toUpperCase(), w / 2, titleY);

  // Small scissors icon (text-based)
  ctx.fillStyle = "#d4af37";
  ctx.font = "48px serif";
  ctx.fillText("✂", w / 2, titleY - 80);

  // Gold line bottom of title
  const lineY2 = lineY + 40;
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, lineY2);
  ctx.lineTo(w * 0.8, lineY2);
  ctx.stroke();

  // Message lines
  const msg = MESSAGES[messageType];
  const msgStartY = format === "story" ? h * 0.42 : h * 0.48;
  const lineHeight = format === "story" ? 80 : 64;

  msg.linhas.forEach((linha, i) => {
    const isLast = i === msg.linhas.length - 1;
    ctx.fillStyle = isLast ? "#d4af37" : "#ffffff";
    ctx.font = isLast ? "bold 44px 'Georgia', serif" : "36px 'Georgia', serif";
    ctx.fillText(linha, w / 2, msgStartY + i * lineHeight);
  });

  // Footer - booking URL
  const footerY = h - (format === "story" ? 120 : 80);
  ctx.fillStyle = "#bbbbbb";
  ctx.font = "28px 'Arial', sans-serif";
  ctx.fillText(BOOKING_URL, w / 2, footerY);

  // Bottom gold accent
  ctx.fillStyle = "#d4af37";
  ctx.fillRect(w * 0.35, h - 40, w * 0.3, 3);
}

const AdminMarketing = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [format, setFormat] = useState<FormatType>("post");
  const [messageType, setMessageType] = useState<MessageType>("divulgacao");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      drawCanvas(canvasRef.current, format, messageType);
    }
  }, [format, messageType]);

  useEffect(() => {
    if (modalOpen) {
      // Small delay so canvas is mounted
      const t = setTimeout(redraw, 50);
      return () => clearTimeout(t);
    }
  }, [modalOpen, redraw]);

  const openModal = (fmt: FormatType) => {
    setFormat(fmt);
    setModalOpen(true);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${BARBEARIA_NOME.replace(/\s/g, "_")}_${format}_${messageType}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast({ title: "Imagem baixada com sucesso!" });
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      if (navigator.share) {
        try {
          const file = new File([blob], "post-instagram.png", { type: "image/png" });
          await navigator.share({ files: [file], title: BARBEARIA_NOME });
        } catch {
          toast({ title: "Compartilhamento cancelado." });
        }
      } else {
        toast({
          title: "Navegador não suporta compartilhamento direto",
          description: "Baixe a imagem e publique no Instagram manualmente.",
        });
      }
    }, "image/png");
  };

  // Preview dimensions (scaled down)
  const previewW = format === "post" ? 320 : 240;
  const previewH = format === "post" ? 320 : 426;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Marketing — Instagram</h1>
      <p className="text-muted-foreground text-sm">
        Gere imagens prontas para Stories e Posts do Instagram da barbearia.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <Card
          className="bg-card border-border cursor-pointer hover:border-primary transition-colors"
          onClick={() => openModal("story")}
        >
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <RectangleVertical className="h-10 w-10 text-primary" />
            <p className="font-semibold text-foreground">Gerar Story</p>
            <p className="text-xs text-muted-foreground">1080 × 1920</p>
          </CardContent>
        </Card>
        <Card
          className="bg-card border-border cursor-pointer hover:border-primary transition-colors"
          onClick={() => openModal("post")}
        >
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <Image className="h-10 w-10 text-primary" />
            <p className="font-semibold text-foreground">Gerar Post</p>
            <p className="text-xs text-muted-foreground">1080 × 1080</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {format === "story" ? "Gerar Story" : "Gerar Post"} — Instagram
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message type selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Tipo de mensagem
              </label>
              <Select
                value={messageType}
                onValueChange={(v) => setMessageType(v as MessageType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="divulgacao">Divulgação da barbearia</SelectItem>
                  <SelectItem value="promocao">Promoção do dia</SelectItem>
                  <SelectItem value="agenda">Agenda aberta</SelectItem>
                  <SelectItem value="finalizado">Corte finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Canvas preview */}
            <div className="flex justify-center bg-muted/30 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                style={{ width: previewW, height: previewH }}
                className="rounded shadow-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Baixar imagem
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketing;
