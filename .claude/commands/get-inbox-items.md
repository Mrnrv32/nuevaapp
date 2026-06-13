Skill: getInboxItems
Archivo: src/skills/getInboxItems.ts

Devuelve todos los items con status 'inbox' del usuario autenticado, ordenados del más reciente al más antiguo.

## Firma
```ts
getInboxItems(): Promise<InboxItem[]>
```

## Código completo
```ts
import { supabase } from '../lib/supabase'
import type { InboxItem } from '../types/inbox'

export async function getInboxItems(): Promise<InboxItem[]> {
  const { data, error } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('status', 'inbox')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as InboxItem[]
}
```

## Uso en React
```ts
import { getInboxItems } from '../skills/getInboxItems'

const items = await getInboxItems()
```

## Reglas
- RLS garantiza que solo devuelve items del usuario autenticado — no pasar user_id manualmente
- Devuelve array vacío `[]` si no hay items (nunca null)
- Solo devuelve status='inbox'. Los procesados no aparecen aquí
