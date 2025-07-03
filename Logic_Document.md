# Logic Document: Collaborative To-Do Board

## Smart Assign Implementation

### Overview
The Smart Assign feature automatically distributes tasks to team members based on their current workload, ensuring fair task allocation and preventing any single user from becoming overwhelmed.

### Algorithm Logic

**Step 1: Data Collection**
- Query all registered users in the system
- For each user, count their current active tasks (tasks with status "todo" or "inprogress")
- Exclude completed tasks ("done" status) from the workload calculation

**Step 2: Workload Analysis**
- Create a mapping of each user to their active task count
- Identify the user(s) with the minimum number of active tasks
- In case of ties, the first user found with the minimum count is selected

**Step 3: Assignment**
- Assign the task to the identified user with the least workload
- Update the task's `assignedTo` field in the database
- Log the assignment action with details about the user's current workload

**Step 4: Notification**
- Broadcast the task update to all connected clients via WebSocket
- Display a notification showing which user received the assignment and why

### Benefits
- **Load Balancing**: Prevents task concentration on specific team members
- **Fairness**: Ensures equitable work distribution across the team
- **Efficiency**: Reduces manual assignment overhead for project managers
- **Transparency**: Logs the assignment reasoning for audit purposes

### Example Scenario
Team has 3 users:
- Alice: 5 active tasks
- Bob: 2 active tasks  
- Charlie: 3 active tasks

When Smart Assign is triggered, the task goes to Bob (fewest active tasks), and the system logs "Smart assigned to Bob (2 active tasks)".

---

## Conflict Handling Implementation

### Overview
The conflict handling system detects and resolves situations where multiple users attempt to edit the same task simultaneously, preventing data loss and maintaining data integrity.

### Detection Mechanism

**Edit Tracking**
- When a user opens a task for editing, the system marks it with:
  - `isBeingEdited: true`
  - `editedBy: userId`
  - `editStartTime: timestamp`

**Conflict Detection**
- Before saving changes, the system checks if another user is currently editing the task
- If `editedBy` differs from the current user, a conflict is detected
- The system captures both versions of the task data

### Resolution Process

**Step 1: Conflict Identification**
- System detects simultaneous edit attempts
- Preserves both the current user's changes and the conflicting version
- Immediately notifies all relevant users about the conflict

**Step 2: Data Presentation**
- Display a conflict resolution modal showing:
  - Current user's version (left side)
  - Other user's version (right side)
  - Clear diff highlighting for each field (title, description, priority, status)

**Step 3: User Choice**
- Users can select which version to keep:
  - "Your Version" - keeps the current user's changes
  - "Other User's Version" - keeps the conflicting user's changes
- Radio button selection ensures only one version is chosen

**Step 4: Resolution & Sync**
- Apply the selected version to the database
- Clear all editing locks (`isBeingEdited: false`, `editedBy: null`)
- Broadcast the resolved task to all connected clients
- Log the conflict resolution for audit purposes

### Cleanup Mechanisms

**Automatic Timeout**
- Editing locks automatically expire after 5 minutes of inactivity
- Prevents permanent locks if users close their browsers without saving

**Disconnect Handling**
- When users disconnect, all their editing locks are immediately cleared
- Ensures tasks don't remain locked by offline users

### Example Conflict Scenario

1. **Setup**: Alice starts editing Task #123 (title: "Review Code")
2. **Concurrent Edit**: Bob simultaneously opens the same task and changes title to "Code Review Complete"
3. **Conflict Trigger**: Alice tries to save her changes (description update)
4. **Detection**: System detects Bob's version differs from Alice's starting point
5. **Resolution UI**: Alice sees both versions:
   - Her version: title "Review Code", updated description
   - Bob's version: title "Code Review Complete", original description
6. **User Decision**: Alice chooses to keep Bob's title but merge her description changes
7. **Final Result**: Task has title "Code Review Complete" with Alice's description updates

### Data Integrity Safeguards
- **Version tracking** prevents overwriting newer changes
- **Atomic updates** ensure partial saves don't corrupt data
- **Rollback capability** allows reverting to pre-conflict state if needed
- **Audit logging** maintains complete change history for debugging

This conflict handling system ensures that no user work is lost while maintaining collaborative workflow efficiency and data consistency across all connected clients.