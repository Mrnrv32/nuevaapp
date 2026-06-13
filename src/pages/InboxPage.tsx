import { useState, useEffect, useCallback } from 'react'
import type { InboxItem, NewInboxItem } from '../types/inbox'
import { captureIdea } from '../skills/captureIdea'
import { getInboxItems } from '../skills/getInboxItems'
import { deleteItem } from '../skills/deleteItem'
import { processItem } from '../skills/processItem'
import InboxCapture from '../components/InboxCapture'
import InboxListItem from '../components/InboxListItem'
import ProcessModal from '../components/ProcessModal'
import './InboxPage.css'

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<InboxItem | null>(null)

  const loadItems = useCallback(async () => {
    try {
      setItems(await getInboxItems())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  const handleCapture = async (input: NewInboxItem) => {
    const item = await captureIdea(input)
    setItems(prev => [item, ...prev])
  }

  const handleDelete = async (id: string) => {
    await deleteItem(id)
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const handleProcess = async (destinationNote: string) => {
    if (!processing) return
    await processItem({ id: processing.id, destinationNote })
    setItems(prev => prev.filter(item => item.id !== processing.id))
    setProcessing(null)
  }

  return (
    <div className="inbox-page">
      <InboxCapture onCapture={handleCapture} />

      {loading ? (
        <p className="inbox-state">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="inbox-state inbox-state--empty">El inbox está vacío</p>
      ) : (
        <ul className="inbox-list">
          {items.map(item => (
            <InboxListItem
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onProcess={setProcessing}
            />
          ))}
        </ul>
      )}

      {processing && (
        <ProcessModal
          item={processing}
          onConfirm={handleProcess}
          onClose={() => setProcessing(null)}
        />
      )}
    </div>
  )
}
