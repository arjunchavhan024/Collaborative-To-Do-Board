import User from '../models/User.js'
import Task from '../models/Task.js'

const setupSocketHandlers = (io) => {
  const connectedUsers = new Map()

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`)

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date()
    })

    // Store connected user
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user
    })

    // Emit updated user list
    const users = await User.find().select('-password')
    io.emit('usersUpdated', users)

    // Handle task editing start
    socket.on('startEditingTask', async (taskId) => {
      try {
        const task = await Task.findById(taskId)
        if (task && !task.isBeingEdited) {
          await Task.findByIdAndUpdate(taskId, {
            isBeingEdited: true,
            editedBy: socket.user._id,
            editStartTime: new Date()
          })

          socket.broadcast.emit('taskEditingStarted', {
            taskId,
            editedBy: socket.user.username
          })
        }
      } catch (error) {
        console.error('Start editing error:', error)
      }
    })

    // Handle task editing end
    socket.on('stopEditingTask', async (taskId) => {
      try {
        await Task.findByIdAndUpdate(taskId, {
          isBeingEdited: false,
          editedBy: null,
          editStartTime: null
        })

        socket.broadcast.emit('taskEditingStopped', { taskId })
      } catch (error) {
        console.error('Stop editing error:', error)
      }
    })

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.broadcast.emit('userTyping', {
        ...data,
        username: socket.user.username
      })
    })

    socket.on('stopTyping', (data) => {
      socket.broadcast.emit('userStoppedTyping', {
        ...data,
        username: socket.user.username
      })
    })

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`)

      // Update user offline status
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date()
      })

      // Remove from connected users
      connectedUsers.delete(socket.user._id.toString())

      // Clean up any tasks being edited by this user
      await Task.updateMany(
        { editedBy: socket.user._id },
        {
          isBeingEdited: false,
          editedBy: null,
          editStartTime: null
        }
      )

      // Emit updated user list
      const users = await User.find().select('-password')
      io.emit('usersUpdated', users)
    })
  })

  // Clean up stale editing sessions every 5 minutes
  setInterval(async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    await Task.updateMany(
      {
        isBeingEdited: true,
        editStartTime: { $lt: fiveMinutesAgo }
      },
      {
        isBeingEdited: false,
        editedBy: null,
        editStartTime: null
      }
    )
  }, 5 * 60 * 1000)
}

export default setupSocketHandlers