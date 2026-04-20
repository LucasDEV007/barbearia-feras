
## Diagnóstico de renderização inicial (mobile)

Lighthouse mobile aponta **FCP 3.5s** e **LCP 3.6s** com **3.98s de "Element render delay"** no `<h1>` do hero. Análise dos dados + código:

### O que está bloqueando o render do hero

| # | Recurso | Problema | Impacto medido |
|---|---------|----------|----------------|
| 1 | `index-DMiVg3Ar.css` (12KB) | Bloqueia render | 153ms |
| 2 | Google Fonts CSS (`fonts.googleapis.com/css2?...`) | Bloqueia render — só descoberto **após** parsear o CSS principal | **780ms** |
| 3 | `Inter.woff2` + `PlayfairDisplay.woff2` | LCP é o `<h1>` em Playfair → texto fica invisível até a fonte chegar | ~3.6s na cadeia |
| 4 | `index-DY7oC8YO.js` (163KB) | JS do app — sem ele o React não monta o `<h1>` | bloqueia LCP |
| 5 | Imagens da galeria (corte-degrade 1.5MB, americano 627KB) | Disputam banda mesmo com `loading="lazy"` (estão a ~2.8k px da dobra mas o navegador faz lookahead) | rouba banda do hero |

### Causa raiz do "Element render delay" de 3.98s

O LCP (texto `Barbearia Feras`) só pinta quando **três coisas convergem**: JS baixado+parseado, CSS principal pronto, e fonte Playfair carregada. A cadeia atual é serial:

```text
HTML → CSS principal (12KB) → Google Fonts CSS (1.7KB) → Playfair.woff2 (39KB)
                            ↘ JS (163KB) → React monta <h1>
```

A fonte Playfair é descoberta **tarde** (só após o CSS principal baixar) e o navegador tem que esperar para pintar o texto. Enquanto isso a galeria de imagens grandes consome banda em paralelo.

### Recomendações priorizadas (todas seguras, sem mexer em rotas/lazy/estrutura)

#### Prioridade 1 — Preload da fonte Playfair (impacto: −500 a −1500ms no LCP)
A fonte do LCP é descoberta tarde. Adicionar `<link rel="preload" as="font">` no `index.html` faz o navegador iniciar o download em paralelo com o CSS, eliminando 1 nível da cadeia crítica.

```html
<link rel="preload" href="https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2" as="font" type="font/woff2" crossorigin>
```

#### Prioridade 2 — `font-display: swap` garantido + fallback metric-compatible (impacto: FCP imediato)
O Google Fonts já entrega `&display=swap`, mas confirmar e adicionar `size-adjust` no `@font-face` fallback para reduzir CLS quando a fonte trocar. Pequeno ajuste no CSS.

#### Prioridade 3 — `media="print"` trick para Google Fonts CSS (impacto: −780ms render-blocking)
Carregar o CSS de fontes de forma não-bloqueante, aplicando após download:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?..." media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?..."></noscript>
```

Texto aparece com fallback (Inter system) e troca quando Playfair chega — sem bloquear o FCP.

#### Prioridade 4 — Recomprimir/redimensionar imagens da galeria (impacto: libera banda do hero)
Lighthouse mostra `corte-degrade.jpg = 1.5MB` (real 960×1280, exibido 315×420) e `corte-americano.jpg = 627KB` (768×1024, exibido 315×420). Mesmo com `loading="lazy"`, o preload scanner mobile baixa cedo. Recomprimir para ~512×682 a 75% qualidade (alvo <80KB cada).

> **Nota:** Os arquivos já foram "comprimidos" antes mas o build em produção mostra 1.5MB e 627KB — provavelmente as versões otimizadas locais não foram aplicadas ou foram revertidas. Vamos confirmar olhando os arquivos atuais em `src/assets/` e re-otimizar se preciso.

#### Prioridade 5 — `fetchpriority="high"` no hero + `low` na galeria
Hero não tem imagem (é só texto), mas vale marcar a galeria com `fetchpriority="low"` para o browser priorizar JS/CSS/fonte do hero.

### O que NÃO recomendamos agora
- Self-host das fontes (mudança estrutural maior).
- Inline crítico do CSS (requer build plugin).
- Remover Playfair (mudaria o visual).

### Plano de execução (sequencial, validar após cada etapa)

1. **`index.html`**: adicionar preload da Playfair + carregar Google Fonts CSS via `media="print"` trick.
2. **`src/assets/`**: re-comprimir e redimensionar `corte-degrade.jpg` e `corte-americano.jpg` para ≤80KB cada em 512×682.
3. **`GaleriaCortes.tsx`**: confirmar `fetchpriority="low"` (já feito anteriormente, validar).
4. Re-rodar Lighthouse mobile.

### Resultado esperado
- FCP: 3.5s → **~1.5–2s**
- LCP: 3.6s → **~2–2.5s**
- Performance score: 77 → **~90+**

Sem nenhuma alteração de layout, lógica de agendamento, rotas ou lazy loading.
