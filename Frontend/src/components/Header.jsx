import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const Header = ({ user, onCreateTask }) => {
  const { logout } = useAuth()
  const { connected } = useSocket()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Collaborative Board
            </h1>
            <div className={`ml-4 flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateTask}
              className="btn-primary"
            >
              + New Task
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium">{user?.username}</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header