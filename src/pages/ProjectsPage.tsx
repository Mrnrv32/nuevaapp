import { useState, useEffect, useCallback } from 'react'
import type { ProjectWithProgress, NewProject } from '../types/projects'
import { getDashboardProjects } from '../skills/getDashboardProjects'
import { createProject } from '../skills/createProject'
import ProjectCard from '../components/ProjectCard'
import ProjectForm from '../components/ProjectForm'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setProjects(await getDashboardProjects('project'))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (input: NewProject) => {
    const created = await createProject(input)
    setProjects(prev => [{ ...created, done_count: 0, total_count: 0 }, ...prev])
  }

  if (loading) return null

  return (
    <div className="projects-page">
      <div className="projects-grid">
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        <button type="button" className="projects-card-new" onClick={() => setShowForm(true)}>
          + Nuevo proyecto
        </button>
      </div>

      {showForm && (
        <ProjectForm
          defaultParaType="project"
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
