import express from 'express'
import Activity from '../models/Activity.js'

const router = express.Router()

// Get recent activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'username')

    res.json(activities)
  } catch (error) {
    console.error('Get activities error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router