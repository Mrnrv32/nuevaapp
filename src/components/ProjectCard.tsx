import { useNavigate } from 'react-router-dom'
import type { ProjectWithProgress } from '../types/projects'
import './ProjectCard.css'

interface Props {
  project: ProjectWithProgress
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate()
  const pct = project.total_count > 0
    ? Math.round((project.done_count / project.total_count) * 100)
    : 0

  return (
    <article
      className="project-card"
      onClick={() => navigate(`/projects/${project.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
    >
      <h3 className="project-card-title">{project.title}</h3>
      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}
      <div className="project-card-footer">
        <div className="project-progress-bar">
          <div className="project-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="project-progress-label">
          {project.done_count}/{project.total_count}
        </span>
      </div>
    </article>
  )
}
