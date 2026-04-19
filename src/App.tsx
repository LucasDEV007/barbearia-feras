import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Agendar = lazy(() => import("./pages/Agendar"));
const MeusAgendamentos = lazy(() => import("./pages/MeusAgendamentos"));
const Login = lazy(() => import("./pages/Login"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAgenda = lazy(() => import("./pages/AdminAgenda"));
const AdminClientes = lazy(() => import("./pages/AdminClientes"));
const AdminFinanceiro = lazy(() => import("./pages/AdminFinanceiro"));
const AdminMarketing = lazy(() => import("./pages/AdminMarketing"));
const AdminFidelidade = lazy(() => import("./pages/AdminFidelidade"));
const AdminCortesRecentes = lazy(() => import("./pages/AdminCortesRecentes"));
const AdminBloqueios = lazy(() => import("./pages/AdminBloqueios"));
const AdminConfiguracoes = lazy(() => import("./pages/AdminConfiguracoes"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agendar" element={<Agendar />} />
            <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="agenda" element={<AdminAgenda />} />
              <Route path="clientes" element={<AdminClientes />} />
              <Route path="financeiro" element={<AdminFinanceiro />} />
              <Route path="marketing" element={<AdminMarketing />} />
              <Route path="fidelidade" element={<AdminFidelidade />} />
              <Route path="cortes-recentes" element={<AdminCortesRecentes />} />
              <Route path="bloqueios" element={<AdminBloqueios />} />
              <Route path="configuracoes" element={<AdminConfiguracoes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
