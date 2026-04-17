import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Agendar from "./pages/Agendar";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAgenda from "./pages/AdminAgenda";
import AdminClientes from "./pages/AdminClientes";
import AdminFinanceiro from "./pages/AdminFinanceiro";
import AdminMarketing from "./pages/AdminMarketing";
import AdminFidelidade from "./pages/AdminFidelidade";
import AdminCortesRecentes from "./pages/AdminCortesRecentes";
import AdminBloqueios from "./pages/AdminBloqueios";
import AdminConfiguracoes from "./pages/AdminConfiguracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agendar" element={<Agendar />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
