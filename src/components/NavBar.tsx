import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { apiLocalService } from '../services/APIRequest'

interface NavBarProps {
    title?: string
}

function NavBar({ title = 'Dashboard' }: NavBarProps) {
    const navigate = useNavigate()
    const { logout, mac, setMac } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleGetMac = async () => {
        try {
            const response = await apiLocalService.get<{ mac: string }>('/client/mac')
            if (response.data.mac) {
                setMac(response.data.mac)
            }
        } catch (error) {
            console.error('Error fetching MAC address:', error)
            alert('Failed to fetch MAC address')
        }
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-5">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold">{title}</span>
                <div className="d-flex align-items-center">
                    {mac && (
                        <span className="text-light me-3 small font-monospace">
                            MAC: {mac}
                        </span>
                    )}
                    <button
                        className="btn btn-sm btn-info me-3"
                        onClick={handleGetMac}
                    >
                        Get Mac
                    </button>
                    <button
                        className="btn btn-sm btn-outline-light"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
