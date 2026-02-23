import { useState } from 'react'

interface CloneProjectFormProps {
    onSubmit: (data: CloneProjectData) => void
    onCancel: () => void
    projectName: string
}

export interface CloneProjectData {
    projectId: number
    rootPath: string
}

function CloneProjectForm({ onSubmit, onCancel, projectName }: CloneProjectFormProps) {
    const [rootPath, setRootPath] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault()

        if (!rootPath.trim()) {
            setError('Please enter a root path')
            return
        }

        // Pass 0 as projectId, it will be overridden in the parent component
        onSubmit({ projectId: 0, rootPath })
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                    ></button>
                </div>
            )}

            <div className="mb-4 text-center">
                <p className="text-muted">Enter the local path where you want to clone <strong>{projectName}</strong>.</p>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Root Path</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter local root path (e.g., /home/ahmadzia/Desktop/work-clone)"
                    value={rootPath}
                    onChange={(e) => setRootPath(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary px-4"
                >
                    Start Clone
                </button>
            </div>
        </form>
    )
}

export default CloneProjectForm;
