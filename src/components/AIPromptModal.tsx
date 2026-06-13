import { useState, useRef, useEffect } from 'react'
import type { Project } from '../types/projects'
import './AIPromptModal.css'

function buildPrompt(project: Project): string {
  return `Soy una persona con TDAH trabajando en el siguiente proyecto:

Título: ${project.title}${project.description ? `\nDescripción: ${project.description}` : ''}

Por favor, desglosa este proyecto en tareas concretas y accionables.
Cada tarea debe:
- Empezar con un verbo de acción (Escribir, Revisar, Enviar, Crear...)
- Ser completable en 15–120 minutos
- Ser autónoma (no depender de otra para poder comenzar)

Responde SOLO con la lista, una tarea por línea, con guión:
- [tarea 1]
- [tarea 2]`
}

interface Props {
  project: Project
  onImport: (titles: string[]) => Promise<void>
  onClose: () => void
}

export default function AIPromptModal({ project, onImport, onClose }: Props) {
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const prompt = buildPrompt(project)
  const resultRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    resultRef.current?.focus()
  }

  const handleImport = async () => {
    const lines = result
      .split('\n')
      .map(l => l.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
      .filter(l => l.length > 0)

    if (lines.length === 0) return
    setImporting(true)
    try {
      await onImport(lines)
      onClose()
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h2 className="ai-modal-title">Generar tareas con IA</h2>
          <button type="button" className="ai-modal-close" onClick={onClose}>×</button>
        </div>

        <section className="ai-modal-section">
          <div className="ai-section-label">
            <span>1. Copia este prompt</span>
            <button type="button" className="btn-copy" onClick={handleCopy}>
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          <pre className="ai-prompt-preview">{prompt}</pre>
        </section>

        <section className="ai-modal-section">
          <div className="ai-section-label">
            <span>2. Pega aquí la respuesta de Claude o ChatGPT</span>
          </div>
          <textarea
            ref={resultRef}
            className="ai-result-textarea"
            placeholder="- Escribir el borrador inicial&#10;- Revisar con el equipo&#10;- Enviar para aprobación"
            value={result}
            onChange={e => setResult(e.target.value)}
            rows={8}
          />
        </section>

        <div className="ai-modal-footer">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className="btn-primary"
            disabled={!result.trim() || importing}
            onClick={handleImport}
          >
            {importing ? 'Importando…' : 'Importar tareas'}
          </button>
        </div>
      </div>
    </div>
  )
}
