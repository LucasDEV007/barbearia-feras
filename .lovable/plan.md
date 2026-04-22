

## Defer Google Maps loading on LocationSection

### Problem

The Google Maps iframe in `LocationSection` loads on page load, which:
- Pulls ~280 KiB of third-party JS (`maps.googleapis.com/maps-api-v3/...`)
- Adds render-blocking and main-thread work
- Hits the Lighthouse "Reduce unused JavaScript" finding directly (maps scripts = ~156 KiB wasted)
- Most visitors never interact with the map

### Solution

Replace the auto-loaded iframe with a lightweight clickable placeholder. The actual iframe only mounts after the user clicks "Ver localização".

### Files modified

**Only `src/components/LocationSection.tsx`** — no other files touched.

### Implementation details

1. **Add state**: `const [showMap, setShowMap] = useState(false)`
2. **Conditional render** inside the existing map container:
   - When `showMap === false`: render a placeholder (same `aspect-video`, same border, same rounded corners) containing:
     - A subtle background using existing tokens (`bg-secondary/50` + faint grid/gradient via Tailwind, no new images)
     - Centered `MapPin` icon (gold, primary color)
     - Small text "Mapa interativo"
     - A `<Button>` "Ver localização" that calls `setShowMap(true)`
   - When `showMap === true`: render the existing `<iframe>` exactly as today
3. **No changes** to:
   - Section title, subtitle, address, hours, "Como chegar" button
   - Grid layout (`md:grid-cols-2`)
   - Outer container, padding, borders
   - URLs / constants

### Visual placeholder (text version)

```text
┌─────────────────────────────────┐
│                                 │
│            [📍 icon]            │
│         Mapa interativo         │
│      [ Ver localização ]        │
│                                 │
└─────────────────────────────────┘
```

Same dimensions as the iframe (`aspect-video`, same rounded border) → zero CLS when the map loads in.

### Performance impact

- Eliminates ~280 KiB of Google Maps JS from initial load
- Removes the `maps.googleapis.com` network requests until interaction
- Improves Lighthouse "Unused JavaScript" and "Network dependency tree"
- Expected mobile LCP/FCP improvement

### Acceptance criteria

- Initial page load shows the placeholder, no Maps requests in Network tab
- Click on "Ver localização" → iframe loads in place, fully interactive
- Layout, spacing, address text, hours, "Como chegar" button all unchanged
- Once loaded, the map stays loaded for the rest of the session (no reload on re-render)

