import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import CloneProjectForm, { type CloneProjectData } from '../components/CloneProjectForm'
import { useAuthStore, useRootPathStore } from '../stores'
import { apiRemoteService, apiLocalService } from '../services/APIRequest'
import FileTree from '../components/FileTree'
import type { FileNode } from "../types"
import { FaInfoCircle, FaCalendarAlt, FaLink, FaDatabase, FaClock } from 'react-icons/fa'

function ProjectDetail() {
    const { id, name } = useParams<{ id: string; name: string }>()
    const navigate = useNavigate()
    const { user, mac } = useAuthStore()
    const { fetchRootPath, getRootPath, rootPaths } = useRootPathStore()
    const rootPath = (id && mac) ? getRootPath(id, mac) : undefined
    const [userState, setUserState] = useState<FileNode | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<number | null>(null)
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
    const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)

    useEffect(() => {
        const fetchUserState = async () => {
            if (!user?.sub || !mac || !id) return

            try {
                setLoading(true)
                const userId = parseInt(user.sub as string, 10)
                const response = await apiRemoteService.get(`/workspaces/${id}/user-state`, {
                    params: {
                        userId,
                        deviceMac: mac
                    }
                })
                setUserState(response.data)
                setError(null)
            } catch (err: any) {
                console.error('Error fetching user state:', err)
                if (err.response?.status === 404) {
                    setError(404)
                } else {
                    setError(err.response?.status || 500)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchUserState()

        if (id && user?.sub && mac) {
            const userId = (user.sub as string);
            fetchRootPath(id, userId, mac);
        }
    }, [id, user?.sub, mac, fetchRootPath])

    const onCloneSubmit = async (data: CloneProjectData) => {
        if (!id) return

        try {
            const response = await apiLocalService.post('/api/clone-project', {
                projectId: parseInt(id, 10),
                rootPath: data.rootPath
            })

            const message = typeof response.data === 'string'
                ? response.data
                : (response.data.message || 'Clone process started in background.')

            alert(message)
            setIsCloneModalOpen(false)

            // Re-fetch user state after starting clone
            const userId = parseInt(user?.sub as string, 10)
            const updatedResponse = await apiRemoteService.get(`/workspaces/${id}/user-state`, {
                params: {
                    userId,
                    deviceMac: mac
                }
            })
            setUserState(updatedResponse.data)
            setError(null)

        } catch (err: any) {
            console.error('Error cloning project:', err)
            const errorData = err.response?.data
            let errorMessage = 'Failed to clone project'

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
    console.log(rootPaths)

    return (
        <div>
            <NavBar title="Project Details" />

            <div className="py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <button
                                className="btn btn-secondary mb-3"
                                onClick={() => navigate('/projects')}
                            >
                                ← Back to Projects
                            </button>

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5">
                                    <div className="text-center mb-4">
                                        <h1 className="card-title h2 fw-bold text-dark">{name}</h1>
                                    </div>

                                    <div className="row mt-4">
                                        <div className="col-md-6 mb-3">
                                            <p className="text-muted small">Project ID</p>
                                            <h5 className="fw-bold">{id}</h5>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <p className="text-muted small">Project Name</p>
                                            <h5 className="fw-bold">{name}</h5>
                                        </div>
                                        {rootPath && (
                                            <div className="col-md-12 mb-3">
                                                <p className="text-muted small">Local Root Path</p>
                                                <h5 className="fw-bold text-primary">{rootPath}</h5>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="my-4" />

                                    <div className="mt-4">
                                        <h5 className="fw-bold mb-3">User State</h5>
                                        {loading ? (
                                            <div className="text-center py-3">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : error === 404 ? (
                                            <div className="text-center py-4 bg-light rounded">
                                                <p className="text-muted mb-3">No local state found for this device.</p>
                                                <button
                                                    className="btn btn-primary px-4"
                                                    onClick={() => setIsCloneModalOpen(true)}
                                                >
                                                    Clone Project
                                                </button>
                                            </div>
                                        ) : userState ? (
                                            <div className="row g-4">
                                                <div className="col-md-5">
                                                    <div className="mb-2">
                                                        <small className="text-muted fw-bold">Project Explorer</small>
                                                    </div>
                                                    <FileTree data={userState} onSelect={setSelectedNode} />
                                                </div>
                                                <div className="col-md-7">
                                                    <div className="mb-2">
                                                        <small className="text-muted fw-bold">Properties</small>
                                                    </div>
                                                    <div className="card border-0 bg-light h-100">
                                                        <div className="card-body">
                                                            {selectedNode ? (
                                                                <div>
                                                                    <div className="d-flex align-items-center mb-4">
                                                                        <div className="bg-white p-2 rounded shadow-sm me-3 text-primary">
                                                                            <FaInfoCircle size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="mb-0 fw-bold">{selectedNode.name}</h5>
                                                                            <span className={`badge ${selectedNode.nodeType === 'folder' ? 'bg-warning text-dark' : 'bg-info'}`}>
                                                                                {selectedNode.nodeType.toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="property-group mb-3">
                                                                        <div className="d-flex align-items-center text-muted small mb-1">
                                                                            <FaDatabase className="me-2" /> Node ID
                                                                        </div>
                                                                        <div className="fw-bold ps-4">{selectedNode.nodeId}</div>
                                                                    </div>

                                                                    {selectedNode.nodeType === 'file' && (
                                                                        <div className="property-group mb-3">
                                                                            <div className="d-flex align-items-center text-muted small mb-1">
                                                                                <FaCalendarAlt className="me-2" /> Last Modified
                                                                            </div>
                                                                            <div className="fw-bold ps-4">
                                                                                {selectedNode.lastModifiedAt ? new Date(selectedNode.lastModifiedAt).toLocaleString() : 'N/A'}
                                                                            </div>

                                                                         
                                                                        </div>
                                                                        
                                                                    )}

                                                                    {selectedNode.nodeType === 'file' && (
                                                                        <>
                                                                            <div className="property-group mb-3">
                                                                                <div className="d-flex align-items-center text-muted small mb-1">
                                                                                    <FaClock className="me-2" /> Version
                                                                                </div>
                                                                                <div className="fw-bold ps-4">{"L:" +selectedNode.localVersionNum}</div>
                                                                                <div className="fw-bold ps-4">
                                                                                {selectedNode.currentVersion ?"C:"+ selectedNode.currentVersion : 'N/A'}
                                                                            </div>
                                                                            </div>

                                                                            <div className="property-group mb-3">
                                                                                <div className="d-flex align-items-center text-muted small mb-1">
                                                                                    <FaLink className="me-2" /> S3 URL
                                                                                </div>
                                                                                <div className="ps-4 overflow-hidden text-truncate" style={{ maxWidth: '100%' }}>
                                                                                    {selectedNode.s3Url ? (
                                                                                        <a href={selectedNode.s3Url} target="_blank" rel="noopener noreferrer" className="text-break small">
                                                                                            {selectedNode.s3Url}
                                                                                        </a>
                                                                                    ) : 'None'}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    <div className="property-group mb-3">
                                                                        <div className="d-flex align-items-center text-muted small mb-1">
                                                                            <FaInfoCircle className="me-2" /> Path
                                                                        </div>
                                                                        <code className="ps-4 d-block small text-dark">{selectedNode.path}</code>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-5">
                                                                    <p className="text-muted">Select a node to view its properties</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="alert alert-danger">
                                                Failed to fetch user state. Please try again.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isCloneModalOpen}
                title="Clone Project"
                onClose={() => setIsCloneModalOpen(false)}
                size="sm"
            >
                <CloneProjectForm
                    projectName={name || ''}
                    onCancel={() => setIsCloneModalOpen(false)}
                    onSubmit={onCloneSubmit}
                />
            </Modal>
        </div>
    )
}

export default ProjectDetail
