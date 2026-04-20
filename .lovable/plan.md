

## Etapa 4 (versão segura): lazy loading parcial na landing

Escopo reduzido — só aplicar `React.lazy` + `Suspense` em 3 seções abaixo da dobra. Sem `requestIdleCallback`, sem mexer em mapa, WhatsApp ou banner PWA.

### Mudanças (apenas `src/pages/Index.tsx`)

**Convertido para lazy:**
- `GaleriaCortes`
- `ReviewsSection`
- `CortesRecentesSection`

**Permanece eager (import estático):**
- `AppHeader`
- `HeroSection`
- `ServicosSection`
- `LocationSection` (mapa — sem mudança)
- `WhatsAppButton` (sem mudança)
- `InstallAppBanner` (sem mudança)
- Footer (inline na própria `Index`)

### Estrutura nova

```tsx
import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import ServicosSection from "@/components/ServicosSection";
import LocationSection from "@/components/LocationSection";
import AppHeader from "@/components/AppHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstallAppBanner from "@/components/InstallAppBanner";

const GaleriaCortes = lazy(() => import("@/components/GaleriaCortes"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const CortesRecentesSection = lazy(() => import("@/components/CortesRecentesSection"));

// No JSX, envolver as 3 seções lazy com:
<Suspense fallback={null}>
  <GaleriaCortes />
  ...
</Suspense>
```

A ordem visual das seções continua exatamente igual à atual.

### Garantias

- **Layout idêntico**: as seções aparecem no mesmo lugar, mesma aparência. `Suspense fallback={null}` evita qualquer flash visual — em conexões normais elas chegam em <100ms.
- **Comportamento idêntico**: nenhuma seção sofre mudança interna. O que mudou foi só *quando* o JS dessas 3 seções é baixado (em chunks separados, em paralelo com o resto).
- **Sem mudanças em**: `App.tsx`, rotas, agendamento, admin, mapa, WhatsApp, banner, fontes, imagens, CSS.
- **Sem `requestIdleCallback`**: as seções montam imediatamente ao serem alcançadas no render — só o *download* do JS é diferido.

### Detalhes técnicos

- Vite gera 3 chunks adicionais (`GaleriaCortes-*.js`, `ReviewsSection-*.js`, `CortesRecentesSection-*.js`) e os remove do bundle principal.
- `CortesRecentesSection` faz 2 chamadas Supabase RPC no `useEffect` — adiar o chunk adia também essas requisições, liberando banda no carregamento crítico.
- `GaleriaCortes` traz 4 imports de assets de imagem — sai do path crítico do bundle inicial.
- Ganho estimado: bundle inicial cai de 163KB para ~130–140KB (redução modesta e segura nesta etapa).

### Resultado esperado (estimativa conservadora)

| Métrica | Antes | Depois |
|---|---|---|
| Bundle inicial JS | 163KB | ~130–140KB |
| FCP mobile | 3.4s | ~2.8–3.0s |
| LCP mobile | 3.6s | ~3.0–3.2s |

Ganho menor do que a versão completa, mas zero risco de mudança perceptível. Após validar, dá para avançar para adiar mapa + `requestIdleCallback` numa etapa futura.

### Validação após aplicar

1. Abrir `/` em mobile (modo anônimo) — página deve carregar visualmente igual.
2. Conferir que galeria, avaliações e cortes recentes aparecem normalmente ao rolar.
3. Mapa, botão WhatsApp e banner PWA continuam idênticos.
4. (Opcional) Rodar Lighthouse mobile e comparar com a baseline atual.

