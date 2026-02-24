import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import CloneProjectForm, { type CloneProjectData } from '../components/CloneProjectForm'
import { useAuthStore, useRootPathStore } from '../stores'
import { apiRemoteService, apiLocalService } from '../services/APIRequest'
import FileTree from '../components/FileTree'
import type { FileNode } from "../types"
import { FaInfoCircle, FaCalendarAlt, FaLink, FaDatabase, FaClock, FaLock, FaSync } from 'react-icons/fa'

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

    const handleRefresh = async () => {
        if (!rootPath || !userState) return;

        try {
            setLoading(true);
            const response = await apiLocalService.get('/client/tree', {
                params: { path: rootPath }
            });

            const localTree = response.data;

            const mergeTrees = (remoteNode: FileNode, localNode: any): FileNode => {
                const updatedNode = { ...remoteNode };

                // Update localLastModified if it's a file
                if (remoteNode.nodeType === 'file') {
                    updatedNode.localLastModified = localNode.lastModifiedAt || localNode.lastModified;
                }

                // Merge children
                if (localNode.children && Array.isArray(localNode.children)) {
                    const remoteChildrenMap = new Map(remoteNode.children.map(child => [child.name, child]));
                    const mergedChildren = [...remoteNode.children];

                    localNode.children.forEach((localChild: any) => {
                        const remoteChild = remoteChildrenMap.get(localChild.name);
                        if (remoteChild) {
                            // Recursive merge for existing nodes
                            const mergedChild = mergeTrees(remoteChild, localChild);
                            const index = mergedChildren.findIndex(c => c.name === localChild.name);
                            mergedChildren[index] = mergedChild;
                        } else {
                            // New node found locally but not in remote state
                            const newNode: FileNode = {
                                nodeId: -1,
                                name: localChild.name,
                                nodeType: (localChild.children && localChild.children.length > 0) || localChild.type === 'folder' ? 'folder' : 'file',
                                path: localChild.path,
                                workspaceId: remoteNode.workspaceId,
                                localVersionNum: 0,
                                currentVersion: 0,
                                latest: false,
                                lastModifiedAt: null,
                                lastSyncedAt: null,
                                s3Url: null,
                                s3VersionId: null,
                                userS3Url: null,
                                userS3VersionId: null,
                                isLocked: false,
                                lockedBy: null,
                                localLastModified: localChild.lastModifiedAt ,
                                children: []
                            };

                            if (localChild.children) {
                                const processedNewNode = mergeTrees(newNode, localChild);
                                mergedChildren.push(processedNewNode);
                            } else {
                                mergedChildren.push(newNode);
                            }
                        }
                    });
                    updatedNode.children = mergedChildren;
                }

                return updatedNode;
            };

            const updatedState = mergeTrees(userState, localTree);
            setUserState(updatedState);
            alert('Local state updated successfully.');
        } catch (err: any) {
            console.error('Error refreshing local state:', err);
            alert('Failed to refresh local state. Make sure the local service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedNode || !id || !rootPath) {
            alert('Missing required information for checkout');
            return;
        }

        // Path transformation: exclude the first segment
        const segments = selectedNode.path.split('/');
        const relativePath = segments.slice(1).join('/');
        const localPath = `${rootPath}/${relativePath}`;

        try {
            const response = await apiLocalService.post('/api/checkout', null, {
                params: {
                    workspaceId: id,
                    localPath: localPath
                }
            });

            const message = typeof response.data === 'string'
                ? response.data
                : (response.data.message || 'Checkout process started successfully.');

            alert(message);
        } catch (err: any) {
            console.error('Error during checkout:', err);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to start checkout';

            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData && typeof errorData === 'object' && errorData.message) {
                errorMessage = errorData.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            alert(errorMessage);
        }
    };

    const handleCheckIn = async (path: string) => {
        if (!id || !rootPath || !name) {
            alert('Missing required information for check-in');
            return;
        }

        // Path transformation: exclude the first segment
        const segments = path.split('/');
        const relativePath = segments.slice(1).join('/');
        const localPath = `${rootPath}/${relativePath}`;

        try {
            const response = await apiLocalService.post('/api/check-in/update', {
                workspaceName: name,
                localPath: localPath
            })

            if (response.status == 202) {
                alert("Check-in process started successfully.");
            }
        } catch (err: any) {
            console.error('Error during check-in:', err);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to start check-in';

            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData && typeof errorData === 'object' && errorData.message) {
                errorMessage = errorData.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            alert(errorMessage);
        }
    };

    const handleCheckInAsNew = async (path: string) => {
        if (!id || !rootPath || !name) {
            alert('Missing required information for check-in');
            return;
        }

        // Path transformation: exclude the first segment
        const segments = path.split('/');
        const relativePath = segments.slice(1).join('/');
        const localPath = `${rootPath}/${relativePath}`;

        try {
            const response = await apiLocalService.post('/api/check-in', {
                workspaceName: name,
                localPath: localPath
            })
            console.log(response)

            if (response.status == 200) {
                alert(response.data || "Check-in process for new file started successfully.");
            }
        } catch (err: any) {
            console.error('Error during check-in as new:', err);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to start check-in as new';

            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData && typeof errorData === 'object' && errorData.message) {
                errorMessage = errorData.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            alert(errorMessage);
        }
    };

 //   console.log(rootPaths)

    return (
        <div>
            <NavBar title="Workspace Details" />

            <div className="py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <button
                                className="btn btn-secondary mb-3"
                                onClick={() => navigate('/projects')}
                            >
                                ← Back to Workspaces
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
                                                <div className="d-flex align-items-center">
                                                    <h5 className="fw-bold text-primary mb-0 me-3">{rootPath}</h5>
                                                    <button
                                                        className="btn btn-outline-primary btn-sm rounded-circle shadow-sm"
                                                        onClick={handleRefresh}
                                                        title="show updated state of the local directory"
                                                        style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <FaSync size={14} />
                                                    </button>
                                                </div>
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
                                                    <FileTree
                                                        data={userState}
                                                        onSelect={setSelectedNode}
                                                        onCheckIn={handleCheckIn}
                                                        onCheckInAsNew={handleCheckInAsNew}
                                                    />
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


                                                                    {selectedNode.nodeType === 'file' && (
                                                                        <div className="property-group mb-3">
                                                                            <div className="d-flex align-items-center text-muted small mb-1">
                                                                                <FaCalendarAlt className="me-2" /> Last Modified (Remote)
                                                                            </div>
                                                                            <div className="fw-bold ps-4">
                                                                                {selectedNode.lastModifiedAt ? new Date(selectedNode.lastModifiedAt).toLocaleString() : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {selectedNode.nodeType === 'file' && selectedNode.localLastModified && (
                                                                        <div className="property-group mb-3">
                                                                            <div className="d-flex align-items-center text-success small mb-1">
                                                                                <FaClock className="me-2" /> Last Modified (Local)
                                                                            </div>
                                                                            <div className="fw-bold ps-4">
                                                                                {new Date(selectedNode.localLastModified).toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {selectedNode.nodeType === 'file' && (
                                                                        <>
                                                                            <div className="property-group mb-3">
                                                                                <div className="d-flex align-items-center text-muted small mb-1">
                                                                                    <FaClock className="me-2" /> Version
                                                                                </div>
                                                                                <div className="fw-bold ps-4">{"L:" + selectedNode.localVersionNum}</div>
                                                                                <div className="fw-bold ps-4">
                                                                                    {selectedNode.currentVersion ? "C:" + selectedNode.currentVersion : 'N/A'}
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

                                                                    {selectedNode.isLocked && (
                                                                        <div className="property-group mb-3">
                                                                            <div className="d-flex align-items-center text-danger small mb-1">
                                                                                <FaLock className="me-2" /> Locked
                                                                            </div>
                                                                            <div className="fw-bold ps-4 text-danger">
                                                                                By: {selectedNode.lockedBy || 'Unknown'}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="mt-4 pt-2 border-top">
                                                                        <button
                                                                            className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                                                                            onClick={handleCheckout}
                                                                            disabled={!rootPath}
                                                                        >
                                                                            <FaClock className="me-2" /> Check Out
                                                                        </button>
                                                                        {!rootPath && (
                                                                            <p className="text-danger small mt-2 mb-0">
                                                                                Local root path not found. Please clone the project first.
                                                                            </p>
                                                                        )}
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
