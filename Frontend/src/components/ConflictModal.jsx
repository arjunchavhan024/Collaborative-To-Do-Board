import { useState } from 'react'
import axios from 'axios'

const ConflictModal = ({ conflict, onResolve }) => {
  const [selectedVersion, setSelectedVersion] = useState('current')
  const [loading, setLoading] = useState(false)

  const handleResolve = async () => {
    setLoading(true)
    try {
      const versionToKeep = selectedVersion === 'current' ? conflict.currentVersion : conflict.conflictingVersion
      await axios.put(`/api/tasks/${conflict.taskId}/resolve-conflict`, {
        resolvedData: versionToKeep,
        resolution: selectedVersion
      })
      onResolve()
    } catch (error) {
      console.error('Error resolving conflict:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Conflict Detected
            </h3>
          </div>

          <p className="text-gray-600 mb-6">
            Another user has modified this task while you were editing it. Please choose which version to keep:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVersion === 'current' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVersion('current')}
            >
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  name="version"
                  value="current"
                  checked={selectedVersion === 'current'}
                  onChange={() => setSelectedVersion('current')}
                  className="text-blue-500"
                />
                <label className="ml-2 font-medium text-gray-900">Your Version</label>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {conflict.currentVersion.title}</p>
                <p><strong>Description:</strong> {conflict.currentVersion.description}</p>
                <p><strong>Priority:</strong> {conflict.currentVersion.priority}</p>
                <p><strong>Status:</strong> {conflict.currentVersion.status}</p>
              </div>
            </div>

            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVersion === 'conflicting' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVersion('conflicting')}
            >
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  name="version"
                  value="conflicting"
                  checked={selectedVersion === 'conflicting'}
                  onChange={() => setSelectedVersion('conflicting')}
                  className="text-blue-500"
                />
                <label className="ml-2 font-medium text-gray-900">Other User's Version</label>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {conflict.conflictingVersion.title}</p>
                <p><strong>Description:</strong> {conflict.conflictingVersion.description}</p>
                <p><strong>Priority:</strong> {conflict.conflictingVersion.priority}</p>
                <p><strong>Status:</strong> {conflict.conflictingVersion.status}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleResolve}
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Resolving...' : 'Resolve Conflict'}
            </button>
            <button
              onClick={onResolve}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal