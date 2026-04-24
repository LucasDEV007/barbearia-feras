import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Agendar = lazy(() => import("./pages/Agendar"));
const MeusAgendamentos = lazy(() => import("./pages/MeusAgendamentos"));
const Login = lazy(() => import("./pages/Login"));
const AuthenticatedProviders = lazy(() => import("./components/AuthenticatedProviders"));
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
const AdminServicos = lazy(() => import("./pages/AdminServicos"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Landing page: no global providers, minimal bundle */}
        <Route path="/" element={<Index />} />

        {/* All other routes share Query/Tooltip/Toast providers */}
        <Route element={<AuthenticatedProviders />}>
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
            <Route path="servicos" element={<AdminServicos />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
