import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { createResource } from '../skills/createResource'
import type { Resource, ResourceType } from '../types/resources'
import TagInput from './TagInput'
import './ResourceCapture.css'

const TYPE_OPTIONS: { value: ResourceType; icon: string; label: string }[] = [
  { value: 'link', icon: '🔗', label: 'URL' },
  { value: 'book', icon: '📖', label: 'Libro' },
  { value: 'note', icon: '📝', label: 'Nota' },
]

interface Props {
  onCapture: (resource: Resource) => void
}

export default function ResourceCapture({ onCapture }: Props) {
  const [type, setType] = useState<ResourceType>('link')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTypeChange(t: ResourceType) {
    setType(t)
    if (t !== 'link') {
      setUrl('')
      setThumbnailUrl('')
    }
  }

  async function fetchMeta(rawUrl: string) {
    if (!rawUrl.trim()) return
    setFetchingMeta(true)
    try {
      const { data } = await supabase.functions.invoke('fetch-url-metadata', {
        body: { url: rawUrl.trim() },
      })
      if (data) {
        if (data.title && !title) setTitle(data.title)
        if (data.description && !description) setDescription(data.description)
        if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url)
      }
    } catch {
      // silently ignore — user fills in manually
    } finally {
      setFetchingMeta(false)
    }
  }

  function reset() {
    setType('link')
    setUrl('')
    setTitle('')
    setDescription('')
    setTags([])
    setThumbnailUrl('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const resource = await createResource({
        title: title.trim(),
        type,
        url: url.trim() || undefined,
        description: description.trim() || undefined,
        tags,
        thumbnail_url: thumbnailUrl || undefined,
      })
      onCapture(resource)
      reset()
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="resource-capture" onSubmit={handleSubmit}>
      <div className="resource-capture-types">
        {TYPE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`resource-type-chip${type === opt.value ? ' resource-type-chip--active' : ''}`}
            onClick={() => handleTypeChange(opt.value)}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {type === 'link' && (
        <div className="resource-capture-field">
          <input
            className={`resource-capture-input${fetchingMeta ? ' resource-capture-input--loading' : ''}`}
            type="url"
            placeholder="https://..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onBlur={() => fetchMeta(url)}
          />
          {fetchingMeta && <span className="resource-capture-spinner" aria-label="Obteniendo info..." />}
        </div>
      )}

      <input
        className="resource-capture-input"
        type="text"
        placeholder="Título *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <textarea
        className="resource-capture-textarea"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
      />

      <TagInput tags={tags} onChange={setTags} />

      {error && <p className="resource-capture-error">{error}</p>}

      <div className="resource-capture-footer">
        <span className="resource-capture-hint">Enter para guardar · Coma para añadir tag</span>
        <button
          type="submit"
          className="resource-capture-save"
          disabled={!title.trim() || saving}
        >
          {saving ? 'Guardando…' : '+ Guardar'}
        </button>
      </div>
    </form>
  )
}
