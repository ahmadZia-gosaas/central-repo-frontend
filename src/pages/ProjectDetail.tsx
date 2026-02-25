import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import CloneProjectForm, { type CloneProjectData } from '../components/CloneProjectForm'
import { useAuthStore, useRootPathStore } from '../stores'
import { apiRemoteService, apiLocalService } from '../services/APIRequest'
import FileTree from '../components/FileTree'
import type { FileNode } from "../types"
import FileHistoryTable from '../components/FileHistoryTable'
import ProjectInfo from '../components/ProjectInfo'
import FileProperties from '../components/FileProperties'
import { mergeTrees } from '../utils/treeUtils'
import { toast } from 'react-hot-toast'

function ProjectDetail() {
    const { id, name } = useParams<{ id: string; name: string }>()
    const navigate = useNavigate()
    const { user, mac } = useAuthStore()
    const { fetchRootPath, getRootPath } = useRootPathStore()
    const rootPath = (id && mac) ? getRootPath(id, mac) : undefined
    const [userState, setUserState] = useState<FileNode | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<number | null>(null)
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
    const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)

    // History states
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [historyData, setHistoryData] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [historyNodeName, setHistoryNodeName] = useState('')

    const fetchUserState = useCallback(async () => {
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
            console.log(err)
            if (err.response?.status === 404) {
                setError(404)
            } else {
                setError(err.response?.status || 500)
            }
        } finally {
            setLoading(false)
        }
    }, [user?.sub, mac, id])

    useEffect(() => {
        fetchUserState()

        if (id && user?.sub && mac) {
            const userId = (user.sub as string);
            fetchRootPath(id, userId, mac);

        }
    }, [id, user?.sub, mac, fetchRootPath, fetchUserState])



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

            toast.success(message)
            setIsCloneModalOpen(false)

            // Re-fetch user state after starting clone
            await fetchUserState()

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

            toast.error(errorMessage)
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

            const updatedState = mergeTrees(userState, localTree);
            setUserState(updatedState);
            toast.success('Local state updated successfully.');
        } catch (err: any) {
            console.error('Error refreshing local state:', err);
            toast.error('Failed to refresh local state. Make sure the local service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedNode || !id || !rootPath) {
            toast.error('Missing required information for checkout');
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

            toast.success(message);
            await fetchUserState();
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

            toast.error(errorMessage);
        }
    };


    const handleCheckIn = async (node: FileNode) => {
        if (!id || !rootPath || !name) {
            toast.error('Missing required information for check-in');
            return;
        }

        if (node.isLocked == true && node.lockedBy != user?.username) {
            toast.error("File is locked by another user cannot perform this action")
            return;
        }

        // Path transformation: exclude the first segment
        const segments = node.path.split('/');
        const relativePath = segments.slice(1).join('/');
        const localPath = `${rootPath}/${relativePath}`;

        try {
            let response;
            if (node.nodeType === 'folder') {
                // Bulk check-in for directories
                response = await apiLocalService.post('/api/check-in/update/bulk', null, {
                    params: {
                        workspaceName: name,
                        localPath: localPath
                    }
                });
            } else {
                // Regular check-in for files
                response = await apiLocalService.post('/api/check-in/update', {
                    workspaceName: name,
                    localPath: localPath
                });
            }

            if (response.status === 200 || response.status === 202) {
                toast.success(response.data || "Check-in process started successfully.");
                await fetchUserState();
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

            toast.error(errorMessage);
        }
    };

    const handleCheckInAsNew = async (node: FileNode) => {
        if (!id || !rootPath || !name) {
            toast.error('Missing required information for check-in');
            return;
        }

        // Path transformation: exclude the first segment
        const segments = node.path.split('/');
        const relativePath = segments.slice(1).join('/');
        const localPath = `${rootPath}/${relativePath}`;

        try {
            const response = await apiLocalService.post('/api/check-in', {
                workspaceName: name,
                localPath: localPath
            })
            console.log(response)

            if (response.status === 200 || response.status === 202) {
                toast.success(response.data || "Check-in process for new item started successfully.");
                await fetchUserState();
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

            toast.error(errorMessage);
        }
    };

    const handleSync = async (node: FileNode) => {
        if (!id || !rootPath) {
            toast.error('Missing required information for sync');
            return;
        }

        // Path transformation: exclude the first segment
        const segments = node.path.split('/');
        const relativePath = segments.slice(1).join('/');
        const localPath = `${rootPath}/${relativePath}`;

        try {
            const response = await apiLocalService.post('/api/latest-version', {
                projectId: parseInt(id, 10),
                localPath: localPath
            })

            if (response.status === 200 || response.status === 202) {
                toast.success(response.data || "Sync process started successfully.");
            }
        } catch (err: any) {
            console.error('Error during sync:', err);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to start sync';

            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData && typeof errorData === 'object' && errorData.message) {
                errorMessage = errorData.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
        }
    };

    const handleHistory = async (node: FileNode) => {
        if (!id) return;

        try {
            setHistoryNodeName(node.name);
            setIsHistoryModalOpen(true);
            setLoadingHistory(true);
            setHistoryData([]);

            const response = await apiRemoteService.post('/api/file-history', {
                nodeId: node.nodeId,
                workspaceId: parseInt(id, 10)
            });

            setHistoryData(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error('Error fetching file history:', err);
            toast.error('Failed to fetch file history.');
        } finally {
            setLoadingHistory(false);
        }
    };

    //   console.log(rootPaths)

    return (
        <div>
            <NavBar title="Workspace Details" />

            <div className="py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12">
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

                                    <ProjectInfo
                                        id={id}
                                        name={name}
                                        rootPath={rootPath}
                                        onRefresh={handleRefresh}
                                    />

                                    <hr className="my-4" />

                                    <div className="mt-4">
                                        <h5 className="fw-bold mb-3">User State</h5>
                                        {loading ? (
                                            <div className="text-center py-3">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : !rootPath ? (
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
                                                        onSync={handleSync}
                                                        onHistory={handleHistory}
                                                    />
                                                </div>
                                                <div className="col-md-7">
                                                    <div className="mb-2">
                                                        <small className="text-muted fw-bold">Properties</small>
                                                    </div>
                                                    <div className="card border-0 bg-light h-100">
                                                        <div className="card-body">
                                                            <FileProperties
                                                                selectedNode={selectedNode}
                                                                rootPath={rootPath}
                                                                onCheckout={handleCheckout}
                                                            />
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

            <Modal
                isOpen={isHistoryModalOpen}
                title={`Version History: ${historyNodeName}`}
                onClose={() => setIsHistoryModalOpen(false)}
                size="lg"

            >
                <FileHistoryTable data={historyData} loading={loadingHistory} filename={historyNodeName} />
            </Modal>
        </div>
    )
}

export default ProjectDetail
