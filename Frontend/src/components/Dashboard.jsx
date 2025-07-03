import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import KanbanBoard from './KanbanBoard'
import ActivityLog from './ActivityLog'
import Header from './Header'
import TaskModal from './TaskModal'
import ConflictModal from './ConflictModal'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [conflict, setConflict] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('taskUpdated', handleTaskUpdate)
      socket.on('taskCreated', handleTaskCreate)
      socket.on('taskDeleted', handleTaskDelete)
      socket.on('activityLogged', handleActivityUpdate)
      socket.on('conflictDetected', handleConflict)
      socket.on('usersUpdated', setUsers)

      return () => {
        socket.off('taskUpdated')
        socket.off('taskCreated')
        socket.off('taskDeleted')
        socket.off('activityLogged')
        socket.off('conflictDetected')
        socket.off('usersUpdated')
      }
    }
  }, [socket])

  const fetchInitialData = async () => {
    try {
      const [tasksRes, usersRes, activitiesRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/users'),
        axios.get('/api/activities')
      ])
      
      setTasks(tasksRes.data)
      setUsers(usersRes.data)
      setActivities(activitiesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ))
  }

  const handleTaskCreate = (newTask) => {
    setTasks(prev => [...prev, newTask])
  }

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId))
  }

  const handleActivityUpdate = (activity) => {
    setActivities(prev => [activity, ...prev].slice(0, 20))
  }

  const handleConflict = (conflictData) => {
    setConflict(conflictData)
  }

  const createTask = async (taskData) => {
    try {
      await axios.post('/api/tasks', taskData)
      setShowTaskModal(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const updateTask = async (taskId, taskData) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, taskData)
      setEditingTask(null)
      setShowTaskModal(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const smartAssign = async (taskId) => {
    try {
      await axios.post(`/api/tasks/${taskId}/smart-assign`)
    } catch (error) {
      console.error('Error with smart assign:', error)
    }
  }

  const moveTask = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus })
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        user={user} 
        onCreateTask={() => setShowTaskModal(true)}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <KanbanBoard
              tasks={tasks}
              users={users}
              onMoveTask={moveTask}
              onEditTask={(task) => {
                setEditingTask(task)
                setShowTaskModal(true)
              }}
              onDeleteTask={deleteTask}
              onSmartAssign={smartAssign}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ActivityLog activities={activities} />
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onSave={editingTask ? 
            (data) => updateTask(editingTask._id, data) :
            createTask
          }
        />
      )}

      {conflict && (
        <ConflictModal
          conflict={conflict}
          onResolve={() => setConflict(null)}
        />
      )}
    </div>
  )
}

export default Dashboard