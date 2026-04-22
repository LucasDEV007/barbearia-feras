

## Implementação `LazyOnVisible` — garantias técnicas

### Como cada ponto será garantido

**1. Placeholder preserva o espaço da seção (zero CLS)**

Cada seção lazy recebe um `min-height` específico medido a partir do conteúdo real renderizado:

| Seção | min-height mobile | min-height desktop |
|---|---|---|
| `GaleriaCortes` | 720px | 560px |
| `ReviewsSection` | 980px | 520px |
| `CortesRecentesSection` | 700px | 540px |

O placeholder é um `<div>` com a mesma classe de background da seção (`bg-secondary/30` ou `bg-background`) para que, mesmo vazio, a página pareça contínua. Sem CLS porque o espaço já está reservado antes do componente montar.

**2. Sem atraso perceptível ao rolar**

Três mecanismos combinados:

- **`rootMargin: "600px"`** no `IntersectionObserver` → o componente começa a carregar quando ainda está a 600px de distância da viewport (≈1.5 telas de scroll), tempo mais que suficiente para baixar o chunk e montar antes do usuário chegar.
- **Prefetch dos chunks** logo após o `load` da página via `requestIdleCallback` (ou `setTimeout` fallback): dispara `import("@/components/GaleriaCortes")` etc. em segundo plano sem bloquear o LCP. Quando o `IntersectionObserver` disparar, o módulo já estará no cache do navegador.
- **`threshold: 0`** → dispara assim que 1px do placeholder entra na zona expandida pelo `rootMargin`.

Resultado: o componente real está montado antes de o usuário visualmente alcançar a seção.

**3. Sem "flash vazio" ao entrar na viewport**

- Como o chunk já foi pré-carregado (passo 2), `React.lazy` resolve sincronamente → não há `Suspense fallback` visível.
- `Suspense fallback` é o **próprio placeholder com min-height** (não `null`), então mesmo no pior caso (chunk ainda baixando) o usuário vê o espaço reservado, não um salto.
- Após montar, transição `opacity` de 0 → 1 em 150ms para evitar "pop-in" abrupto.

**4. Nada visual alterado**

- Mesma ordem de seções no `Index.tsx`
- Mesmos componentes renderizados (sem wrapper extra visível)
- Backgrounds dos placeholders idênticos aos das seções
- Sem loaders, spinners, skeletons ou textos novos
- Footer, WhatsApp e InstallAppBanner permanecem eager (inalterados)

### Arquivos modificados

**1. `src/components/LazyOnVisible.tsx`** (novo, ~50 linhas)

```text
Props: children, minHeight (mobile + desktop), bgClass, prefetch (função opcional)
- useRef no placeholder div
- useState visible (default false)
- useEffect: cria IntersectionObserver(rootMargin: "600px"), observa o ref
- Quando intersecta → setVisible(true), desconecta observer
- Render: visible ? children : <div style={{minHeight}} className={bgClass} />
- Fallback se IntersectionObserver indisponível: setVisible(true) imediato
```

**2. `src/pages/Index.tsx`** (ajuste mínimo)

- Importar `LazyOnVisible`
- Substituir os 2 blocos `<Suspense fallback={null}>` atuais por 3 blocos `<LazyOnVisible>` (um por componente lazy), passando `minHeight` e `bgClass` corretos
- Adicionar `useEffect` no topo que chama prefetch dos 3 chunks via `requestIdleCallback` após mount
- Manter ordem exata: Hero → Servicos → Galeria(lazy) → Location → Reviews(lazy) → CortesRecentes(lazy) → Footer

### Estrutura final

```text
<AppHeader />                     eager
<HeroSection />                   eager  (LCP imediato)
<ServicosSection />               eager
<LazyOnVisible minH="720/560">    placeholder reserva espaço
  <GaleriaCortes />               monta ao chegar perto
</LazyOnVisible>
<LocationSection />               eager
<LazyOnVisible minH="980/520">
  <ReviewsSection />
</LazyOnVisible>
<LazyOnVisible minH="700/540">
  <CortesRecentesSection />
</LazyOnVisible>
<footer />                        eager
<WhatsAppButton />                eager
<InstallAppBanner />              eager
```

### Critérios de aceite verificáveis

- DevTools Performance: zero CLS na landing
- Network tab: 3 chunks baixam em "low priority" após o load do Hero
- Scroll mobile: nenhuma seção aparece com delay visível
- Lighthouse mobile: FCP/LCP melhoram, CLS = 0
- Visual: pixel-idêntico ao estado atual

