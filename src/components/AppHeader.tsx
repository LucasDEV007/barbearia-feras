import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, CalendarDays, ShieldCheck, Home } from "lucide-react";
import { BARBEARIA_NOME } from "@/lib/constants";
import heroEmblem from "@/assets/hero-emblem.png";
import { useEffect, useState } from "react";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Defer Supabase load: only on non-landing routes, and only when the
    // browser is idle, to keep the landing page bundle and TTI clean.
    if (location.pathname === "/") return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const loadAuth = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      if (cancelled) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setIsAuthenticated(!!session);
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => setIsAuthenticated(!!session),
      );
      unsubscribe = () => subscription.unsubscribe();
    };

    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;
    const handle = ric
      ? ric(() => { void loadAuth(); }, { timeout: 2000 })
      : window.setTimeout(() => { void loadAuth(); }, 200);

    return () => {
      cancelled = true;
      if (ric) {
        (window as Window & { cancelIdleCallback?: (h: number) => void })
          .cancelIdleCallback?.(handle as number);
      } else {
        clearTimeout(handle as number);
      }
      unsubscribe?.();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border px-4 py-3 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={heroEmblem} alt="" width={56} height={56} className="h-12 w-12 md:h-14 md:w-14 object-contain scale-125 drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)]" />
          <h1 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
            {BARBEARIA_NOME}
          </h1>
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            variant={isActive("/") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Início</span>
            </Link>
          </Button>

          <Button
            variant={isActive("/agendar") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/agendar">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Agendar</span>
            </Link>
          </Button>

          <Button
            variant={isActive("/admin") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>

          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
