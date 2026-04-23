import { LayoutDashboard, CalendarDays, Users, DollarSign, Megaphone, LogOut, Gift, Camera, CalendarOff, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BARBEARIA_NOME } from "@/lib/constants";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

const items = [
  { title: "Visão Geral", url: "/admin", icon: LayoutDashboard, prefetch: () => import("@/pages/AdminDashboard") },
  { title: "Agenda", url: "/admin/agenda", icon: CalendarDays, prefetch: () => import("@/pages/AdminAgenda") },
  { title: "Clientes", url: "/admin/clientes", icon: Users, prefetch: () => import("@/pages/AdminClientes") },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, prefetch: () => import("@/pages/AdminFinanceiro") },
  { title: "Marketing", url: "/admin/marketing", icon: Megaphone, prefetch: () => import("@/pages/AdminMarketing") },
  { title: "Fidelidade", url: "/admin/fidelidade", icon: Gift, prefetch: () => import("@/pages/AdminFidelidade") },
  { title: "Cortes Recentes", url: "/admin/cortes-recentes", icon: Camera, prefetch: () => import("@/pages/AdminCortesRecentes") },
  { title: "Bloqueios", url: "/admin/bloqueios", icon: CalendarOff, prefetch: () => import("@/pages/AdminBloqueios") },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings, prefetch: () => import("@/pages/AdminConfiguracoes") },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 text-primary">
          <Scissors className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              {BARBEARIA_NOME}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                      onMouseEnter={() => { void item.prefetch(); }}
                      onTouchStart={() => { void item.prefetch(); }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
