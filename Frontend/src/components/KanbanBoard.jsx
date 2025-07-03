import { useState } from 'react'
import TaskCard from './TaskCard'
import { useDrop } from 'react-dnd'

const COLUMNS = [
  { id: 'todo', title: 'To Do', bgColor: 'bg-gray-50' },
  { id: 'inprogress', title: 'In Progress', bgColor: 'bg-blue-50' },
  { id: 'done', title: 'Done', bgColor: 'bg-green-50' }
]

const KanbanBoard = ({ tasks, users, onMoveTask, onEditTask, onDeleteTask, onSmartAssign }) => {
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const Column = ({ column }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'task',
      drop: (item) => {
        if (item.status !== column.id) {
          onMoveTask(item.id, column.id)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    })

    const columnTasks = getTasksByStatus(column.id)

    return (
      <div 
        ref={drop}
        className={`column ${column.bgColor} ${isOver ? 'ring-2 ring-primary-300' : ''} transition-all duration-200`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-lg">
            {column.title}
          </h3>
          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {columnTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              users={users}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onSmartAssign={onSmartAssign}
            />
          ))}
        </div>
        
        {columnTasks.length === 0 && (
          <div className="text-center text-gray-500 mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p>No tasks in {column.title.toLowerCase()}</p>
            <p className="text-sm mt-1">Drag tasks here or create new ones</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Board</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(column => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard