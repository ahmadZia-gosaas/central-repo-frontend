import { useState } from 'react'
import { confirm } from './Confirm'

interface CreateProjectFormProps {
    onSubmit: (data: ProjectFormData) => void
    onCancel: () => void
    confirmationOnCancel?: boolean
}

export interface ProjectFormData {
    localPath: string
    workspaceName: string
    description: string
}

function CreateProjectForm({ onSubmit, onCancel, confirmationOnCancel = false }: CreateProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        localPath: '',
        workspaceName: '',
        description: ''
    })
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.localPath.trim()) {
            setError('Please select a local path')
            return
        }
        if (!formData.workspaceName.trim()) {
            setError('Please enter a workspace name')
            return
        }
        if (!formData.description.trim()) {
            setError('Please enter a description')
            return
        }
        if(formData.workspaceName.length > 20) {
            setError('Workspace name should not exceed 50 characters')
            return
        }
        if(formData.description.length > 50) {
            setError('Description should not exceed 50 characters')
            return
        }
        

        onSubmit(formData)
    }
    const handleCancel = async () => {
        if (confirmationOnCancel) {
            if (await confirm({ message: 'Are you sure you want to cancel?' })) {
                onCancel()
            }
        } else {
            onCancel()
        }
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

            <div className="mb-3">
                <label className="form-label fw-bold">Local Path</label>
                <input
                    type="text"
                    className="form-control"
                    name="localPath"
                    placeholder="Enter local path (e.g., /home/user/projects/my-repo)"
                    value={formData.localPath}
                    onChange={handleInputChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Workspace Name</label>
                <input
                    type="text"
                    className="form-control"
                    name="workspaceName"
                    placeholder="Enter workspace name"
                    value={formData.workspaceName}
                    onChange={handleInputChange}
                />
                <small className="text-muted d-block mt-1">
                    💡 Tip: Workspace name should match the last directory name of your local path
                </small>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Description</label>
                <textarea
                    className="form-control"
                    name="description"
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={handleInputChange as any}
                    rows={3}
                ></textarea>
            </div>

            <div className="d-flex gap-2 justify-content-end">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    Create Workspace
                </button>
            </div>
        </form>
    )
}

export default CreateProjectForm
