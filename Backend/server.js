import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'

// Import routes
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import userRoutes from './routes/users.js'
import activityRoutes from './routes/activities.js'

// Import middleware
import authMiddleware from './middleware/auth.js'
import socketAuth from './middleware/socketAuth.js'

// Import socket handlers
import setupSocketHandlers from './socket/handlers.js'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(limiter)

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-todo')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// Socket authentication middleware
io.use(socketAuth)

// Setup socket handlers
setupSocketHandlers(io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', authMiddleware, taskRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/activities', authMiddleware, activityRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { io }