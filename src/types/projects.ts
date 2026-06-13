export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type ParaType = 'project' | 'area' | 'resource' | 'archive'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: ProjectStatus
  para_type: ParaType
  created_at: string
  updated_at: string
}

export type NewProject = Pick<Project, 'title' | 'description' | 'para_type'>
export type ProjectPatch = Partial<Pick<Project, 'title' | 'description' | 'status' | 'para_type'>>

export interface ProjectWithProgress extends Project {
  done_count: number
  total_count: number
}
