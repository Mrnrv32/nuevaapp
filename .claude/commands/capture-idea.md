Skill: captureIdea
Archivo: src/skills/captureIdea.ts

Guarda una idea nueva en la bandeja de entrada del usuario autenticado.

## Firma
```ts
captureIdea(input: NewInboxItem): Promise<InboxItem>

// NewInboxItem = { text: string, tags: InboxTag[] }
// InboxTag = 'idea' | 'tarea'
```

## Código completo
```ts
import { supabase } from '../lib/supabase'
import type { InboxItem, NewInboxItem } from '../types/inbox'

export async function captureIdea(input: NewInboxItem): Promise<InboxItem> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('inbox_items')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as InboxItem
}
```

## Uso en React
```ts
import { captureIdea } from '../skills/captureIdea'

const item = await captureIdea({ text: 'Mi idea', tags: ['idea'] })
```

## Reglas
- `tags` puede ser `[]`, `['idea']`, `['tarea']`, o `['idea', 'tarea']`
- Requiere usuario autenticado vía Supabase Auth
- En caso de éxito devuelve el item completo con `id` y `created_at` generados
