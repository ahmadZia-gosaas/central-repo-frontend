import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import NavBar from '../components/NavBar'

function QuickOverview() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    return (
        <div>
            <NavBar title="Quick Overview" />

            <div className="py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <button
                                className="btn btn-secondary mb-3"
                                onClick={() => navigate('/welcome')}
                            >
                                ← Back to Welcome
                            </button>
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5">
                                    <div className="text-center mb-4">
                                        <h1 className="card-title h2 fw-bold text-dark">Account Overview</h1>
                                        <p className="text-muted">Here's a quick summary of your account.</p>
                                    </div>

                                    {/* <div className="row mt-4">
                                        <div className="col-md-4 mb-3">
                                            <div className="card border-light">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">Total Projects</h5>
                                                    <p className="h3 fw-bold text-primary">0</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="card border-light">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">Active Users</h5>
                                                    <p className="h3 fw-bold text-success">1</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="card border-light">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">Last Login</h5>
                                                    <p className="small text-muted">Just now</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}

                                    {user && (
                                        <div className="card bg-light border-0 mt-4">
                                            <div className="card-body">
                                                <h5 className="card-title">User Details</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-sm mb-0">
                                                        <tbody>
                                                            <tr>
                                                                <td className="fw-bold text-muted">Name:</td>
                                                                <td>{user?.name || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold text-muted">Email:</td>
                                                                <td>{user?.email || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold text-muted">Username:</td>
                                                                <td>{user?.username || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-bold text-muted">Role:</td>
                                                                <td>{user?.role || 'N/A'}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
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
        </div>
    )
}

export default QuickOverview
