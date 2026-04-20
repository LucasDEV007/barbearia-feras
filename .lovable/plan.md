

## Diagnóstico de performance no mobile

### Causa principal (confirmada)

**1. Imagem `corte-degrade.jpg` com 1.5 MB** (`src/assets/`)
- Tamanhos atuais: degrade **1.5MB**, americano **613KB**, social 117KB, moicano 57KB.
- Mesmo com `loading="lazy"` na `GaleriaCortes`, em mobile a galeria está bem perto da dobra (logo abaixo do hero) e o navegador frequentemente decide pré-baixar. Em conexão 4G a degrade sozinha custa ~3–5 segundos e disputa banda com JS/CSS críticos, atrasando FCP/LCP.
- Total da pasta: ~2.3 MB de JPG para 4 thumbnails de 512×682 — desproporcional.

**2. Google Fonts via `@import` em `src/index.css`**
- `@import` dentro de CSS é **render-blocking serializado**: o navegador só descobre a URL do Google Fonts depois de baixar e parsear o CSS principal, criando uma "cadeia em série" CSS → fonts.googleapis.com → fonts.gstatic.com.
- Baixa 5 pesos de Inter (300/400/500/600/700) + 4 de Playfair (400/600/700/800), sendo que o site usa basicamente 400/600/700.
- O LCP do hero é o `<h1>` em Playfair — a fonte chega tarde no mobile, segurando o LCP.

**3. Ícone PWA de 285 KB** (`public/icon-512.png`)
- Não bloqueia FCP, mas é referenciado pelo manifest e baixado cedo em alguns navegadores mobile. Está super-dimensionado para um PNG (deveria ter ~30–60 KB).

### Causas secundárias

- Ausência de `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com`.
- Imagens da galeria sem `decoding="async"` e sem `fetchpriority="low"` explícito.
- Sem dimensões otimizadas: imagens são 512×682 mas os arquivos originais estão muito acima do necessário para essa caixa.

### Recomendações priorizadas (todas seguras, sem mudar layout)

| # | Ação | Ganho esperado | Risco |
|---|------|----------------|-------|
| 1 | **Recomprimir as 4 imagens da galeria** para JPG ~80% qualidade na resolução real exibida (≤512×682). Meta: cada uma <80 KB. Especialmente `corte-degrade.jpg` (1.5MB → ~60KB) | LCP mobile: **−1.5 a −3s** | Nenhum (mesmo arquivo, mesmo path, mesma aparência) |
| 2 | **Mover Google Fonts do `@import` no CSS para `<link>` no `index.html`** com `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` antes. Reduzir pesos para 400/600/700 de cada família | FCP/LCP: **−200 a −500 ms** | Nenhum (mesmas famílias, mesmos pesos visíveis) |
| 3 | **Adicionar `decoding="async"` e `fetchpriority="low"`** nas imagens da `GaleriaCortes` para que não disputem banda com recursos críticos | LCP mobile: **−100 a −300 ms** | Nenhum |
| 4 | **Recomprimir `icon-512.png`** (285KB → ~50KB) com pngquant/oxipng | TBT mobile: leve melhora | Nenhum (mesma imagem) |

### Por que NÃO recomendamos agora

- **Converter para WebP/AVIF**: traria mais ganho, mas exige mudar imports e fallbacks — fora do escopo "sem mudanças estruturais".
- **Service Worker / cache PWA**: ajuda 2ª visita, não a primeira (foco do problema).
- **Mudar lazy loading de rotas**: já implementado e correto.

### Prioridade de execução sugerida

1. **Etapa 2A** — recomprimir as 4 imagens da galeria (impacto máximo, esforço mínimo).
2. **Etapa 2B** — migrar Google Fonts para `<link>` + preconnect + reduzir pesos.
3. **Etapa 2C** — atributos `decoding`/`fetchpriority` nas imgs da galeria.
4. **Etapa 2D** — recomprimir `icon-512.png`.

Cada etapa pode ser aplicada e validada isoladamente, sem alterar layout, lógica de agendamento ou o lazy loading já implementado.

