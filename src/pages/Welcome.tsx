import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import NavBar from '../components/NavBar'

function Welcome() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div>
      <NavBar title="Dashboard" />

      <div className="py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm border-0">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h1 className="card-title h2 fw-bold text-dark">Welcome{user?.name ? `, ${user.name}` : ''}!</h1>
                    <p className="text-muted">You have successfully logged in.</p>
                  </div>
                  
                  {user && (
                    <div className="alert alert-info" role="alert">
                      <strong>Hello {user?.email || 'User'}</strong> - This is your dashboard. You can start building your application here.
                    </div>
                  )}
                  
                  {user && (
                    <div className="card bg-light border-0 mb-4">
                      <div className="card-body">
                        <h5 className="card-title">User Information</h5>
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
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row mt-4">
                    <div className="col-md-6 mb-3">
                      <div className="card border-light">
                        <div className="card-body">
                          <h5 className="card-title">See Your Workspaces </h5>
                          <p className="card-text small text-muted">View and manage all workspaces.</p>
                          <a href="/projects" className="btn btn-sm btn-primary">View Workspaces</a>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card border-light">
                        <div className="card-body">
                          <h5 className="card-title">Quick Overview</h5>
                          <p className="card-text small text-muted">Get a quick overview of your account.</p>
                          <a href="/quick-overview" className="btn btn-sm btn-primary">View Overview</a>
                        </div>
                      </div>
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

export default Welcome
