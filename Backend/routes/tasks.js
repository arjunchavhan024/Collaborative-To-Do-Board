import express from 'express'
import Task from '../models/Task.js'
import User from '../models/User.js'
import { logActivity } from '../utils/activityLogger.js'
import { io } from '../server.js'

const router = express.Router()

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, assignedTo, status } = req.body

    // Validation
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    // Check for unique title
    const existingTask = await Task.findOne({ title: title.trim() })
    if (existingTask) {
      return res.status(400).json({ message: 'Task title must be unique' })
    }

    // Validate title doesn't match column names
    const columnNames = ['todo', 'in progress', 'done', 'inprogress']
    if (columnNames.includes(title.toLowerCase())) {
      return res.status(400).json({ message: 'Task title cannot match column names' })
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'medium',
      assignedTo: assignedTo || null,
      status: status || 'todo',
      createdBy: req.user._id
    })

    await task.save()
    await task.populate('assignedTo', 'username')
    await task.populate('createdBy', 'username')

    // Log activity
    await logActivity('created', req.user._id, req.user.username, task._id, task.title)

    // Emit to all connected clients
    io.emit('taskCreated', task)

    res.status(201).json(task)
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, assignedTo, status } = req.body
    const taskId = req.params.id

    const existingTask = await Task.findById(taskId)
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Check for conflicts
    if (existingTask.isBeingEdited && 
        existingTask.editedBy && 
        existingTask.editedBy.toString() !== req.user._id.toString()) {
      
      // Detect conflict
      const conflictData = {
        taskId: taskId,
        currentVersion: { title, description, priority, assignedTo, status },
        conflictingVersion: {
          title: existingTask.title,
          description: existingTask.description,
          priority: existingTask.priority,
          assignedTo: existingTask.assignedTo,
          status: existingTask.status
        }
      }

      io.emit('conflictDetected', conflictData)
      return res.status(409).json({ message: 'Conflict detected', conflict: conflictData })
    }

    // Validate title uniqueness (excluding current task)
    if (title && title !== existingTask.title) {
      const titleExists = await Task.findOne({ 
        title: title.trim(), 
        _id: { $ne: taskId } 
      })
      if (titleExists) {
        return res.status(400).json({ message: 'Task title must be unique' })
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo || null }),
        ...(status && { status }),
        lastEditedBy: req.user._id,
        version: existingTask.version + 1,
        isBeingEdited: false,
        editedBy: null,
        editStartTime: null
      },
      { new: true }
    ).populate('assignedTo', 'username').populate('createdBy', 'username')

    // Log activity
    const changes = []
    if (title && title !== existingTask.title) changes.push(`title: "${existingTask.title}" → "${title}"`)
    if (status && status !== existingTask.status) changes.push(`status: ${existingTask.status} → ${status}`)
    if (priority && priority !== existingTask.priority) changes.push(`priority: ${existingTask.priority} → ${priority}`)
    
    await logActivity(
      status && status !== existingTask.status ? 'moved' : 'updated',
      req.user._id,
      req.user.username,
      updatedTask._id,
      updatedTask.title,
      changes.length > 0 ? changes.join(', ') : undefined
    )

    // Emit to all connected clients
    io.emit('taskUpdated', updatedTask)

    res.json(updatedTask)
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    await Task.findByIdAndDelete(req.params.id)

    // Log activity
    await logActivity('deleted', req.user._id, req.user.username, task._id, task.title)

    // Emit to all connected clients
    io.emit('taskDeleted', req.params.id)

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Smart assign task
router.post('/:id/smart-assign', async (req, res) => {
  try {
    const taskId = req.params.id

    // Get all users and their task counts
    const users = await User.find()
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const activeTaskCount = await Task.countDocuments({
          assignedTo: user._id,
          status: { $in: ['todo', 'inprogress'] }
        })
        return { user, count: activeTaskCount }
      })
    )

    // Find user with minimum active tasks
    const userWithMinTasks = userTaskCounts.reduce((min, current) => 
      current.count < min.count ? current : min
    )

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        assignedTo: userWithMinTasks.user._id,
        lastEditedBy: req.user._id
      },
      { new: true }
    ).populate('assignedTo', 'username').populate('createdBy', 'username')

    // Log activity
    await logActivity(
      'assigned',
      req.user._id,
      req.user.username,
      updatedTask._id,
      updatedTask.title,
      `Smart assigned to ${userWithMinTasks.user.username} (${userWithMinTasks.count} active tasks)`
    )

    // Emit to all connected clients
    io.emit('taskUpdated', updatedTask)

    res.json(updatedTask)
  } catch (error) {
    console.error('Smart assign error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Resolve conflict
router.put('/:id/resolve-conflict', async (req, res) => {
  try {
    const { resolvedData, resolution } = req.body
    const taskId = req.params.id

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        ...resolvedData,
        lastEditedBy: req.user._id,
        isBeingEdited: false,
        editedBy: null,
        editStartTime: null
      },
      { new: true }
    ).populate('assignedTo', 'username').populate('createdBy', 'username')

    // Log activity
    await logActivity(
      'conflict_resolved',
      req.user._id,
      req.user.username,
      updatedTask._id,
      updatedTask.title,
      `Conflict resolved by keeping ${resolution} version`
    )

    // Emit to all connected clients
    io.emit('taskUpdated', updatedTask)

    res.json(updatedTask)
  } catch (error) {
    console.error('Resolve conflict error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router