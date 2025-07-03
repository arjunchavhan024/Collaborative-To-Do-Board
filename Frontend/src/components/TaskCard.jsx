import { useState } from 'react'
import { useDrag } from 'react-dnd'

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

const TaskCard = ({ task, users, onEdit, onDelete, onSmartAssign }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task._id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const assignedUser = users.find(user => user._id === task.assignedTo)

  const handleFlip = () => {
    setIsFlipped(true)
    setTimeout(() => setIsFlipped(false), 600)
  }

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? 'opacity-50' : ''} ${isFlipped ? 'animate-card-flip' : ''}`}
      onClick={handleFlip}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">
          {task.title}
        </h4>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task._id)
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        
        <div className="flex items-center space-x-2">
          {assignedUser ? (
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {assignedUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600">{assignedUser.username}</span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSmartAssign(task._id)
              }}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              Smart Assign
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Created: {new Date(task.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}

export default TaskCard