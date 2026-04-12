import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-md mx-auto">
      <Download className="h-8 w-8 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">Instalar aplicativo</p>
        <p className="text-xs text-muted-foreground">Acesse mais rápido direto da tela inicial</p>
      </div>
      <Button size="sm" onClick={handleInstall} className="shrink-0">
        Instalar
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground p-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default InstallAppBanner;
