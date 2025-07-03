import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return next(new Error('Authentication error'))
    }

    socket.user = user
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
}

export default socketAuth