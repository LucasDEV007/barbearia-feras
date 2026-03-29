import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Share2, Image, RectangleVertical, Copy, Upload, X } from "lucide-react";
import { BARBEARIA_NOME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

type FormatType = "story" | "post";
type MessageType = "divulgacao" | "promocao" | "agenda" | "finalizado";

const DEFAULT_MESSAGES: Record<MessageType, string[]> = {
  divulgacao: [
    "Já fez seu corte essa semana?",
    "Não? Está esperando o quê?",
    "Agende agora o seu horário.",
  ],
  promocao: [
    "Promoção da semana.",
    "Corte + barba por preço especial.",
    "Agende agora.",
  ],
  agenda: [
    "Agenda aberta para hoje.",
    "Garanta seu horário.",
    "Agende agora.",
  ],
  finalizado: [
    "Mais um corte finalizado.",
    "Obrigado pela preferência.",
  ],
};

const MESSAGE_LABELS: Record<MessageType, string> = {
  divulgacao: "Divulgação da barbearia",
  promocao: "Promoção do dia",
  agenda: "Agenda aberta",
  finalizado: "Corte finalizado",
};

const BOOKING_URL = "barbearia-feras.lovable.app";

function drawCanvas(
  canvas: HTMLCanvasElement,
  format: FormatType,
  lines: string[],
  bgImage: HTMLImageElement | null
) {
  const w = 1080;
  const h = format === "story" ? 1920 : 1080;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Background
  if (bgImage) {
    // Draw image covering canvas
    const imgRatio = bgImage.width / bgImage.height;
    const canvasRatio = w / h;
    let sw = bgImage.width, sh = bgImage.height, sx = 0, sy = 0;
    if (imgRatio > canvasRatio) {
      sw = bgImage.height * canvasRatio;
      sx = (bgImage.width - sw) / 2;
    } else {
      sh = bgImage.width / canvasRatio;
      sy = (bgImage.height - sh) / 2;
    }
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, w, h);
    // Dark overlay for readability
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, w, h);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1a1a1a");
    grad.addColorStop(0.5, "#222222");
    grad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Texture dots
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    for (let i = 0; i < 300; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gold line top
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

  // Scissors icon
  ctx.fillStyle = "#d4af37";
  ctx.font = "48px serif";
  ctx.fillText("✂", w / 2, titleY - 80);

  // Gold line bottom of title
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, lineY + 40);
  ctx.lineTo(w * 0.8, lineY + 40);
  ctx.stroke();

  // Message lines
  const msgStartY = format === "story" ? h * 0.42 : h * 0.48;
  const lineHeight = format === "story" ? 80 : 64;

  lines.forEach((linha, i) => {
    const isLast = i === lines.length - 1;
    ctx.fillStyle = isLast ? "#d4af37" : "#ffffff";
    ctx.font = isLast ? "bold 44px 'Georgia', serif" : "36px 'Georgia', serif";
    ctx.fillText(linha, w / 2, msgStartY + i * lineHeight);
  });

  // Footer
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
  const [customText, setCustomText] = useState("");
  const [bgImageSrc, setBgImageSrc] = useState<string | null>(null);
  const [bgImageEl, setBgImageEl] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Current lines from custom text or default
  const currentLines = customText.trim()
    ? customText.split("\n").filter(Boolean)
    : DEFAULT_MESSAGES[messageType];

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      drawCanvas(canvasRef.current, format, currentLines, bgImageEl);
    }
  }, [format, currentLines, bgImageEl]);

  useEffect(() => {
    if (modalOpen) {
      const t = setTimeout(redraw, 50);
      return () => clearTimeout(t);
    }
  }, [modalOpen, redraw]);

  // When message type changes, reset custom text
  const handleMessageTypeChange = (v: string) => {
    setMessageType(v as MessageType);
    setCustomText("");
  };

  const openModal = (fmt: FormatType) => {
    setFormat(fmt);
    setCustomText("");
    setBgImageSrc(null);
    setBgImageEl(null);
    setModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImageSrc(url);
    const img = new window.Image();
    img.onload = () => setBgImageEl(img);
    img.src = url;
  };

  const removeImage = () => {
    if (bgImageSrc) URL.revokeObjectURL(bgImageSrc);
    setBgImageSrc(null);
    setBgImageEl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${BOOKING_URL}`);
    toast({ title: "Link copiado!" });
  };

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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {format === "story" ? "Gerar Story" : "Gerar Post"} — Instagram
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Tipo de mensagem
              </label>
              <Select value={messageType} onValueChange={handleMessageTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MESSAGE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Editable text */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Texto da mensagem
              </label>
              <Textarea
                placeholder={DEFAULT_MESSAGES[messageType].join("\n")}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="bg-secondary border-border text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Edite o texto ou deixe vazio para usar o padrão. Uma linha por frase.
              </p>
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Foto de fundo (opcional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {bgImageSrc ? (
                <div className="flex items-center gap-2">
                  <img src={bgImageSrc} alt="Fundo" className="h-16 w-16 object-cover rounded" />
                  <Button variant="ghost" size="sm" onClick={removeImage}>
                    <X className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" /> Enviar foto
                </Button>
              )}
            </div>

            {/* Canvas preview */}
            <div className="flex justify-center bg-muted/30 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                style={{ width: previewW, height: previewH }}
                className="rounded shadow-lg"
              />
            </div>

            {/* Copyable link */}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`https://${BOOKING_URL}`}
                className="bg-secondary border-border text-sm flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1 shrink-0">
                <Copy className="h-4 w-4" /> Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Cole este link na legenda do seu post no Instagram.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" /> Baixar imagem
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
                <Share2 className="h-4 w-4" /> Compartilhar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketing;
