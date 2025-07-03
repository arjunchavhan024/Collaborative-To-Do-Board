const ActivityLog = ({ activities }) => {
  const getActivityIcon = (action) => {
    switch (action) {
      case 'created':
        return '➕'
      case 'updated':
        return '✏️'
      case 'deleted':
        return '🗑️'
      case 'assigned':
        return '👤'
      case 'moved':
        return '🔄'
      default:
        return '📝'
    }
  }

  const getActivityColor = (action) => {
    switch (action) {
      case 'created':
        return 'text-green-600'
      case 'updated':
        return 'text-blue-600'
      case 'deleted':
        return 'text-red-600'
      case 'assigned':
        return 'text-purple-600'
      case 'moved':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
            <div 
              key={activity._id || index}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-slide-in"
            >
              <span className="text-lg">
                {getActivityIcon(activity.action)}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.username}</span>
                  <span className={`ml-1 ${getActivityColor(activity.action)}`}>
                    {activity.action}
                  </span>
                  {activity.taskTitle && (
                    <span className="ml-1">task "{activity.taskTitle}"</span>
                  )}
                </p>
                
                {activity.details && (
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.details}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityLog