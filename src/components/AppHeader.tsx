import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, LogOut, CalendarDays, ShieldCheck, Home } from "lucide-react";
import { BARBEARIA_NOME } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border px-4 py-3 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
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
            <Link to={isAuthenticated ? "/admin" : "/login"}>
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
