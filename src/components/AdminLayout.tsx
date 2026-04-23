import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

// Prefetch admin route chunks so tab switches feel instant.
const prefetchAdminRoutes = () => {
  import("@/pages/AdminDashboard");
  import("@/pages/AdminAgenda");
  import("@/pages/AdminClientes");
  import("@/pages/AdminFinanceiro");
  import("@/pages/AdminMarketing");
  import("@/pages/AdminFidelidade");
  import("@/pages/AdminCortesRecentes");
  import("@/pages/AdminBloqueios");
  import("@/pages/AdminConfiguracoes");
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthState("unauthed");
        navigate("/login", { replace: true });
      } else {
        setAuthState("authed");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthState("unauthed");
        navigate("/login", { replace: true });
      } else {
        setAuthState("authed");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (authState !== "authed") return;
    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;
    const handle = ric
      ? ric(prefetchAdminRoutes, { timeout: 3000 })
      : window.setTimeout(prefetchAdminRoutes, 800);
    return () => {
      if (ric) {
        (window as Window & { cancelIdleCallback?: (h: number) => void })
          .cancelIdleCallback?.(handle as number);
      } else {
        clearTimeout(handle as number);
      }
    };
  }, [authState]);

  if (authState !== "authed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-4 bg-background">
            <SidebarTrigger className="ml-0" />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
