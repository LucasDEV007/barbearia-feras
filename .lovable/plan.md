
## Etapa 1: Lazy loading das rotas

Aplicar `React.lazy()` + `Suspense` em `src/App.tsx` para todas as rotas exceto `Index` (landing) e `NotFound`.

### Mudanças em `src/App.tsx`

**Imports estáticos a converter em lazy:**
- `Agendar`, `MeusAgendamentos`, `Login`
- `AdminLayout`, `AdminDashboard`, `AdminAgenda`, `AdminClientes`, `AdminFinanceiro`, `AdminMarketing`, `AdminFidelidade`, `AdminCortesRecentes`, `AdminBloqueios`, `AdminConfiguracoes`

**Mantidos como import estático:**
- `Index` (landing — primeira tela, precisa render imediato)
- `NotFound` (rota fallback minúscula)

**Estrutura nova:**
```tsx
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Agendar = lazy(() => import("./pages/Agendar"));
const MeusAgendamentos = lazy(() => import("./pages/MeusAgendamentos"));
const Login = lazy(() => import("./pages/Login"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
// ...demais rotas admin

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

// envolver <Routes> com <Suspense fallback={<RouteFallback />}>
```

### Garantias

- Nenhuma mudança visual: fallback é apenas um spinner centralizado (aparece por frações de segundo no primeiro acesso à rota).
- Nenhuma lógica alterada: componentes carregados são exatamente os mesmos.
- Landing (`/`) continua com render imediato — `Index` permanece estático.
- Recharts (admin) e canvas do Marketing deixam de ir no bundle inicial.

### Resultado esperado

Bundle inicial da landing reduzido em ~40–60% (estimativa baseada no tamanho típico de Recharts + páginas admin).

### Validação sugerida após aplicar

1. Abrir `/` — deve carregar normalmente sem spinner.
2. Navegar para `/agendar` — pode aparecer spinner brevíssimo na primeira vez.
3. Navegar para `/admin` (logado) — idem.
4. Confirmar que todas as rotas continuam funcionando.
