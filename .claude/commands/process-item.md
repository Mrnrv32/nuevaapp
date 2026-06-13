Skill: processItem
Archivo: src/skills/processItem.ts

Mueve un inbox item fuera del inbox asignándole un destino. Actualmente Fase 1 (nota en texto libre). Fase 2 creará FK real a Proyectos cuando ese módulo exista.

## Firma
```ts
processItem(input: ProcessInput): Promise<InboxItem>

interface ProcessInput {
  id: string
  destinationNote: string  // Ej: "Proyecto: App TDAH", "Rutina: mañanas", "Seguimiento: trabajo"
}
```

## Código completo
```ts
import { supabase } from '../lib/supabase'
import type { InboxItem } from '../types/inbox'

export interface ProcessInput {
  id: string
  destinationNote: string
}

export async function processItem({ id, destinationNote }: ProcessInput): Promise<InboxItem> {
  const { data, error } = await supabase
    .from('inbox_items')
    .update({ status: 'processed', destination_note: destinationNote })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as InboxItem
}
```

## Uso en React
```ts
import { processItem } from '../skills/processItem'

const updated = await processItem({
  id: item.id,
  destinationNote: 'Proyecto: App TDAH'
})
// Remover item del estado local del inbox
```

## Fase 2 (pendiente — cuando existan Proyectos)
Reemplazar `destination_note: string` por:
```ts
interface ProcessInput {
  id: string
  destinationType: 'project' | 'routine' | 'tracking'
  destinationId?: string   // ID del entity existente
  destinationName?: string // Nombre si se crea nuevo
}
```
Y agregar FK `destination_id uuid REFERENCES public.projects(id)` en la tabla.
