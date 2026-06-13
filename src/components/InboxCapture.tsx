import { useState, useRef, useEffect, useCallback } from 'react'
import type { InboxTag, NewInboxItem } from '../types/inbox'
import './InboxCapture.css'

interface Props {
  onCapture: (input: NewInboxItem) => Promise<void>
}

export default function InboxCapture({ onCapture }: Props) {
  const [text, setText] = useState('')
  const [tags, setTags] = useState<InboxTag[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const toggleTag = (tag: InboxTag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const save = useCallback(async () => {
    if (!text.trim() || saving) return
    setSaving(true)
    try {
      await onCapture({ text: text.trim(), tags })
      setText('')
      setTags([])
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(false)
      textareaRef.current?.focus()
    }
  }, [text, tags, saving, onCapture])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      save()
    }
  }

  return (
    <div className="capture">
      <div className="capture-field">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué tienes en mente?"
          rows={4}
          disabled={saving}
        />
        {saved && <div className="capture-saved">Guardado</div>}
      </div>
      {error && <div className="capture-error">{error}</div>}
      <div className="capture-actions">
        <div className="capture-tags">
          {(['idea', 'tarea'] as InboxTag[]).map(tag => (
            <button
              key={tag}
              type="button"
              className={`tag-chip${tags.includes(tag) ? ' tag-chip--active' : ''}`}
              onClick={() => toggleTag(tag)}
              disabled={saving}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="capture-save"
          onClick={save}
          disabled={!text.trim() || saving}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
