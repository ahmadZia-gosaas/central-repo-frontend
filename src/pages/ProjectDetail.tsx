import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

function ProjectDetail() {
    const { id, name } = useParams<{ id: string; name: string }>()
    const navigate = useNavigate()

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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetail
