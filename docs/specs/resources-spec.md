# Resources — Spec v1.0

**Estado:** Pendiente de aprobación · 2026-06-13  
**Módulo anterior:** [areas-nav-refactor-spec.md](areas-nav-refactor-spec.md) ✅

---

## Contexto

La "R" de P.A.R.A.: material de referencia que no pertenece a un proyecto activo ni a un área de responsabilidad, pero que quieres poder recuperar cuando lo necesites. Hoy ese material se pierde en WhatsApp o en una carpeta de bookmarks que nunca vuelves a abrir.

Un Resource es cualquier **"cosa que quiero revisar después"**: links, videos de YouTube, libros, notas mentales, PDFs. Lo capturas rápido, lo etiquetas opcionalmente, y lo encuentras después por texto o tag.

---

## Arquitectura

### NavBar — actualizado (5 destinos)

```
Inbox ★  |  Dashboard  |  Proyectos  |  Áreas  |  Resources
```

### Rutas nuevas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/resources` | `ResourcesPage` | Lista + captura + filtros |

No hay ruta de detalle en v1. Todo se gestiona desde la página principal.

---

## Schema — tabla `resources`

```sql
CREATE TABLE resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  url         TEXT,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'link'
                CHECK (type IN ('link', 'book', 'note')),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'read')),
  tags        TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS pública (igual que resto de tablas)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_all ON resources FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX resources_status_idx ON resources (status);
CREATE INDEX resources_type_idx ON resources (type);
CREATE INDEX resources_tags_idx ON resources USING GIN (tags);
CREATE INDEX resources_created_at_idx ON resources (created_at DESC);

-- Trigger updated_at
CREATE TRIGGER set_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### Campos

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `title` | text | ✅ | Auto-populated desde URL metadata; editable |
| `url` | text | — | Presente en tipos `link`; vacío en `book` y `note` |
| `description` | text | — | Auto-populated desde og:description; editable |
| `type` | enum | ✅ | `link` · `book` · `note` |
| `status` | enum | ✅ | `pending` (default) · `read` |
| `tags` | text[] | — | Tags de texto libre, múltiples |
| `thumbnail_url` | text | — | Para YouTube: thumbnail oEmbed; otros: og:image |

---

## Auto-fetch de URL Metadata

Cuando el usuario pega una URL en el formulario, la app intenta obtener título y descripción automáticamente.

### Estrategia

**YouTube** (detectado por `youtube.com` o `youtu.be` en la URL):
- Llamada directa desde el browser a `https://www.youtube.com/oembed?url=<URL>&format=json`
- Devuelve: `title`, `thumbnail_url`, `author_name`
- Sin API key. Sin CORS issues.

**Cualquier otra URL**:
- Llamada a Supabase Edge Function `fetch-url-metadata`
- La Edge Function hace el fetch server-side (sin CORS) y extrae:
  - `og:title` → `title`
  - `og:description` → `description`
  - `og:image` → `thumbnail_url`
  - Fallback: `<title>` del HTML si no hay og:title

### Edge Function: `fetch-url-metadata`

```
Input:  { url: string }
Output: { title?: string, description?: string, thumbnail_url?: string }
```

- Timeout: 5 segundos. Si falla, devuelve objeto vacío — el usuario completa manualmente.
- No se guarda el contenido de la página, solo los metadatos.

### UX del auto-fetch

1. Usuario pega URL en el campo
2. Al salir del campo (`onBlur`) o al presionar Enter: spinner inline por 1-2 seg
3. Campos `title` y `description` se autocompletan
4. Usuario puede editarlos antes de guardar
5. Si el fetch falla: campos quedan vacíos, sin mensaje de error intrusivo (solo el campo vacío para llenar)

---

## Skills

| Archivo | Función | Descripción |
|---------|---------|-------------|
| `getResources.ts` | `getResources(filters?)` | Lista resources; acepta `{ type?, status?, tag?, search? }` |
| `createResource.ts` | `createResource(data)` | Inserta resource nuevo |
| `updateResource.ts` | `updateResource(id, data)` | Actualiza campos por ID (incluyendo marcar como leído) |
| `deleteResource.ts` | `deleteResource(id)` | Hard delete por ID |

`getResources` con `search` hace `ILIKE %term%` sobre `title || ' ' || description`.

---

## Página: ResourcesPage (`/resources`)

### Layout

```
┌──────────────────────────────────────────────────┐
│  Resources                                       │
│  ┌────────────────────────────────────────────┐  │
│  │  🔗 URL  /  📖 Libro  /  📝 Nota          │  │
│  │  [                                      ] [+]│  │
│  │  Título (auto / manual)                    │  │
│  │  Tags: [tag1] [tag2] [+]                   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [Todos] [Pendientes] [Leídos]  🔍 buscar...    │
│  Tipo: [Todos ▾]   Tag: [Todos ▾]               │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🔗 Cómo funciona el cerebro TDAH    [✓] [×]│   │
│  │    youtube.com · #TDAH #neurología · hoy  │   │
│  ├──────────────────────────────────────────┤   │
│  │ 📖 Atomic Habits — James Clear      [✓] [×]│   │
│  │    #hábitos · hace 3 días                 │   │
│  ├──────────────────────────────────────────┤   │
│  │ 📝 Nota sobre sistema P.A.R.A.       [✓] [×]│   │
│  │    #productividad · hace 1 semana         │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Sección de captura (siempre visible arriba)

- Selector de tipo: `🔗 URL` · `📖 Libro` · `📝 Nota` (3 tabs o chips)
- Campo URL (visible solo en tipo `link`): pegar URL → auto-fetch
- Campo `title`: texto libre, requerido
- Campo `tags`: multi-input de texto libre — escribes, presionas Enter/coma, se añade como chip
- Campo `description`: textarea colapsable (expandible con click)
- Botón `+` o Enter para guardar

### Lista de resources

- Vista densa: una fila por resource
- Columnas: ícono de tipo · título · dominio (si es link) · tags · fecha relativa
- Botón `[✓]`: marca como leído (toggle)
- Botón `[×]`: elimina sin confirmación (igual que Inbox)
- Click en fila: expande descripción inline (no modal, no nueva página)
- Resources leídos: aparecen con opacidad reducida, no se ocultan

### Filtros

- Tabs de estado: `Todos` · `Pendientes` · `Leídos` (default: Todos)
- Buscador de texto: filtra title + description en tiempo real (debounce 300ms)
- Selector de tipo: `Todos` · `Link` · `Libro` · `Nota`
- Selector de tag: dropdown con todos los tags existentes en la BD

---

## Componentes

| Componente | Descripción |
|-----------|-------------|
| `ResourceCapture.tsx` | Formulario de captura rápida (siempre visible en la parte superior) |
| `ResourceList.tsx` | Lista filtrada + barra de filtros |
| `ResourceItem.tsx` | Fila individual: ícono, título, tags, acciones |
| `ResourceFilters.tsx` | Tabs de estado + buscador + selectors de tipo y tag |
| `TagInput.tsx` | Input de chips para tags (reutilizable en futuras features) |

---

## Tipos TypeScript

```typescript
// src/types/resources.ts

export type ResourceType = 'link' | 'book' | 'note';
export type ResourceStatus = 'pending' | 'read';

export interface Resource {
  id: string;
  title: string;
  url?: string;
  description?: string;
  type: ResourceType;
  status: ResourceStatus;
  tags: string[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceFilters {
  type?: ResourceType;
  status?: ResourceStatus;
  tag?: string;
  search?: string;
}

export interface UrlMetadata {
  title?: string;
  description?: string;
  thumbnail_url?: string;
}
```

---

## Orden de implementación

1. **Schema** — migración SQL en Supabase
2. **Edge Function** — `fetch-url-metadata` (Deno)
3. **Types** — `src/types/resources.ts`
4. **Skills** — `getResources`, `createResource`, `updateResource`, `deleteResource`
5. **Componentes** — `TagInput` → `ResourceCapture` → `ResourceItem` → `ResourceFilters` → `ResourceList`
6. **Página** — `ResourcesPage.tsx` + ruta en `App.tsx`
7. **NavBar** — añadir "Resources" como 5to destino
8. **Verificación** — browser: captura link YouTube, auto-fetch título, filtros, marcar como leído, eliminar

---

## Fuera de scope (v1)

- Upload de archivos PDF (solo link externo al PDF)
- Detalle de resource en página propia (`/resources/:id`)
- Ordenamiento manual por drag & drop
- Import masivo de bookmarks
- Compartir resources
- Vista de tabla tipo spreadsheet (evaluable en v2 si la lista densa no escala)
