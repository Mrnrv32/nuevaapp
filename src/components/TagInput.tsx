import { useState } from 'react'
import './TagInput.css'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}

export default function TagInput({ tags, onChange, disabled }: Props) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag)) {
      setInput('')
      return
    }
    onChange([...tags, tag])
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className={`tag-input${disabled ? ' tag-input--disabled' : ''}`}>
      {tags.map(tag => (
        <span key={tag} className="tag-input-chip">
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(tags.filter(t => t !== tag))}
              aria-label={`Quitar ${tag}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          className="tag-input-field"
          type="text"
          placeholder={tags.length === 0 ? 'Añadir tag...' : ''}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag(input)}
        />
      )}
    </div>
  )
}
