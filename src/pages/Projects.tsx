import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import CreateProjectForm, { type ProjectFormData } from '../components/CreateProjectForm'
import { apiRemoteService, apiLocalService } from '../services/APIRequest'
import type { Workspace } from '../types'

function Projects() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiRemoteService.get<Workspace[]>('/workspaces')
                setWorkspaces(response.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load workspaces')
                console.error('Error fetching workspaces:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkspaces()
    }, [])

    const filteredWorkspaces = workspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateWorkspace = async (formData: ProjectFormData) => {
        console.log('Creating project:', formData)
        if (!formData.localPath.trim() || !formData.workspaceName.trim() || !formData.description.trim()) {
            alert('Please fill in all fields')
            return
        }
        if (formData.localPath.includes(' ')) {
            alert('Local path cannot contain spaces')
            return
        }
        if (formData.workspaceName.includes(' ')) {
            alert('Workspace name cannot contain spaces')
            return
        }

        // Validate that localPath ends with workspaceName
        const pathParts = formData.localPath.split(/[/\\]/)
        const lastPart = pathParts[pathParts.length - 1]
        if (lastPart !== formData.workspaceName) {
            alert(`The last folder of the local path ("${lastPart}") must match the workspace name ("${formData.workspaceName}")`)
            return
        }

        try {
            const response = await apiLocalService.post('/api/create-project', formData)
            if (response.status === 200) {
                alert('Workspace initialized. Sync process started in background.')
                setIsModalOpen(false)

                // Refresh workspaces list
                const fetchWorkspaces = async () => {
                    try {
                        const response = await apiRemoteService.get<Workspace[]>('/workspaces')
                        setWorkspaces(response.data)
                    } catch (err) {
                        console.error('Error refreshing workspaces:', err)
                    }
                }
                fetchWorkspaces()
            }
        } catch (err: any) {
            console.error('Error creating project:', err)
            const errorData = err.response?.data
            let errorMessage = 'Failed to create workspace'

            if (typeof errorData === 'string') {
                errorMessage = errorData
            } else if (errorData && typeof errorData === 'object' && errorData.message) {
                errorMessage = errorData.message
            } else if (err instanceof Error) {
                errorMessage = err.message
            }

            alert(errorMessage)
        }
    }

    return (
        <div>
            <NavBar title="Workspaces" />

            <div className="py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="text-dark fw-bold mb-0">Your Workspaces</h2>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    + Create Workspace
                                </button>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5">
                                    <div className="text-center mb-4">
                                        <h1 className="card-title h2 fw-bold text-dark">Your Workspaces</h1>
                                        <p className="text-muted">Manage and view all workspaces here.</p>
                                    </div>

                                    {user && (
                                        <div className="alert alert-info" role="alert">
                                            <strong>Hello {user?.email || 'User'}</strong> - You can view and manage your Workspaces below.
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg border-2"
                                            placeholder="Search workspaces by name or description..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {loading && (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="text-muted mt-3">Loading workspaces...</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            <strong>Error:</strong> {error}
                                        </div>
                                    )}

                                    {!loading && !error && filteredWorkspaces.length > 0 && (
                                        <div className="row mt-4">
                                            {filteredWorkspaces.map((workspace) => (
                                                <div key={workspace.id} className="col-md-6 mb-3">
                                                    <div
                                                        className="card h-100 cursor-pointer"
                                                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                                        onClick={() => navigate(`/projects/${workspace.id}/${workspace.name}`)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-5px)'
                                                            e.currentTarget.classList.add('shadow-lg')
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)'
                                                            e.currentTarget.classList.remove('shadow-lg')
                                                        }}
                                                    >
                                                        <div className="card-body">
                                                            <h5 className="card-title">{workspace.name}</h5>
                                                            <p className="card-text text-muted">{workspace.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!loading && !error && workspaces.length > 0 && filteredWorkspaces.length === 0 && (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No workspaces match your search query.</p>
                                            <button className="btn btn-link" onClick={() => setSearchQuery('')}>Clear Search</button>
                                        </div>
                                    )}

                                    {!loading && !error && workspaces.length === 0 && (
                                        <div className="row mt-4">
                                            <div className="col-12">
                                                <div className="text-center py-5">
                                                    <p className="text-muted">No workspaces found. Create your first workspace to get started.</p>
                                                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Workspace</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                title="Create New Workspace"
                onClose={() => setIsModalOpen(false)}
                size="lg"
            >
                <CreateProjectForm
                    onSubmit={handleCreateWorkspace}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    )
}

export default Projects
