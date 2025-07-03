import Activity from '../models/Activity.js'
import { io } from '../server.js'

export const logActivity = async (action, userId, username, taskId = null, taskTitle = null, details = null, metadata = null) => {
  try {
    const activity = new Activity({
      action,
      userId,
      username,
      taskId,
      taskTitle,
      details,
      metadata
    })

    await activity.save()

    // Emit to all connected clients
    io.emit('activityLogged', activity)

    return activity
  } catch (error) {
    console.error('Activity logging error:', error)
  }
}