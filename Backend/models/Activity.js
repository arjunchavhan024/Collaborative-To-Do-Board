import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'assigned', 'moved', 'conflict_resolved']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  taskTitle: {
    type: String
  },
  details: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Index for better query performance
activitySchema.index({ createdAt: -1 })

export default mongoose.model('Activity', activitySchema)