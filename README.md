# Collaborative To-Do Board

A real-time collaborative task management application built with React.js, Express.js, MongoDB, and Socket.IO.

## 🚀 Features

### Core Functionality

- **User Authentication**: Secure registration and login with JWT tokens
- **Real-time Collaboration**: Live updates across all connected users via WebSockets
- **Kanban Board**: Drag-and-drop interface with Todo, In Progress, and Done columns
- **Task Management**: Create, edit, delete, and assign tasks with priorities
- **Activity Logging**: Track all user actions with detailed activity feed
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Unique Features

- **Smart Assign**: Automatically assigns tasks to users with the fewest active tasks
- **Conflict Resolution**: Detects when multiple users edit the same task and provides resolution options
- **Real-time Indicators**: Shows online users and live editing status
- **Custom Animations**: Smooth transitions and micro-interactions for enhanced UX

## 🛠 Tech Stack

### Frontend

- **React.js** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React DnD** - Drag and drop functionality
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend

- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Rate Limit** - API rate limiting

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd collaborative-todo-board
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Environment Configuration**

   ```bash
   # Copy environment file in Backend folder
   cp Backend/.env.example Backend/.env
   ```

   Update the `.env` file with your MongoDB URI and other configurations:

   ```env
   MONGODB_URI=mongodb://localhost:27017/collaborative-todo
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start both frontend (port 5173) and backend (port 5000) servers concurrently.

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🏗 Project Structure

```
collaborative-todo-board/
├── Frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth, Socket)
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── Backend/                 # Express.js backend application
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── socket/             # Socket.IO handlers
│   ├── utils/              # Utility functions
│   ├── server.js           # Server entry point
│   └── package.json        # Backend dependencies
└── package.json            # Root package.json for scripts
```

## 🔧 Key Features Implementation

### Smart Assign Algorithm

The Smart Assign feature automatically distributes tasks to users based on their current workload:

1. **Query all users** in the system
2. **Count active tasks** (Todo + In Progress) for each user
3. **Select the user** with the minimum number of active tasks
4. **Assign the task** and log the activity
5. **Broadcast the update** to all connected clients

**Logic**: The algorithm ensures fair task distribution by always assigning new tasks to the least busy team member, promoting balanced workloads across the team.

### Conflict Handling System

When multiple users attempt to edit the same task simultaneously:

1. **Track editing state** - Tasks have `isBeingEdited`, `editedBy`, and `editStartTime` fields
2. **Detect conflicts** - When a user saves changes while another user is editing
3. **Present both versions** - Show current user's changes vs. conflicting changes
4. **User resolution** - Allow users to choose which version to keep
5. **Automatic cleanup** - Remove stale editing locks after 5 minutes of inactivity

**Example Scenario**: User A starts editing a task title, User B simultaneously edits the same task's description. When User B saves first, User A sees a conflict dialog showing both versions and can choose to merge or overwrite.

### Real-time Synchronization

- **WebSocket connections** maintain persistent communication
- **Event-driven updates** ensure all users see changes instantly
- **Optimistic updates** provide responsive UI while syncing with server
- **Connection status indicators** show real-time connectivity

## 🎨 Design Principles

### User Experience

- **Intuitive drag-and-drop** interface for task management
- **Visual feedback** for all user interactions
- **Loading states** and error handling for smooth experience
- **Mobile-responsive** design for cross-device usage

### Performance

- **Efficient re-renders** using React best practices
- **Debounced API calls** to reduce server load
- **Optimized MongoDB queries** with proper indexing
- **Rate limiting** to prevent API abuse

### Security

- **JWT authentication** with secure token storage
- **Password hashing** using bcryptjs
- **Input validation** on both client and server
- **CORS protection** for API endpoints

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend: `cd Frontend && npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update environment variables for production API URL

### Backend Deployment (Render/Railway/Heroku)

1. Set up MongoDB Atlas or your preferred cloud MongoDB service
2. Configure environment variables on your hosting platform
3. Deploy the Backend folder
4. Update CORS settings for your frontend domain

### Environment Variables for Production

```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=your-frontend-domain
PORT=5000
NODE_ENV=production
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Task Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/smart-assign` - Smart assign task
- `PUT /api/tasks/:id/resolve-conflict` - Resolve task conflict

### Other Endpoints

- `GET /api/users` - Get all users
- `GET /api/activities` - Get recent activities
- `GET /api/health` - Health check

## 🧪 Testing

### Manual Testing Scenarios

1. **Multi-user collaboration**: Open multiple browser windows with different users
2. **Real-time updates**: Create/edit tasks in one window, verify updates in others
3. **Conflict resolution**: Edit the same task simultaneously from different accounts
4. **Smart assign**: Create tasks and test automatic assignment logic
5. **Drag and drop**: Move tasks between columns and verify persistence

### Recommended Testing

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Socket.IO connection testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

**Thank You!** 🎉
