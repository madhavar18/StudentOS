// TaskCard.jsx
// WHY a seperate component: same reason BankAccount was seperate
// A task is a self-contained unit of UI with its own structure.
// Rendering 50 tasks means rendering <TaskCard /> 50 times.
// The parent never needs to know HOW a task renders - just pass the data.

function TaskCard({ task, onComplete, onDelete }) {
    const{ _id, title, type, deadline, completed, subtasks = [] } = task;

    // Derived values - computed from props, not stored as state
    // WHY not state: these are always calculable from task data.
    // Storing them as state creates a sync problem - two sources of truth.
    const completedSubtasks = subtasks.filter(s  => s.completed).length;
    const progress = subtasks.length > 0 
        ? Math.round((completedSubtasks / subtasks.length) * 100)
        : completed ? 100 : 0;

        const urgency = getUrgency(deadline, completed);

        return(
            <div className={`task-card ${urgency.level} ${completed ? 'done' : ''}`}>
                <div className="task-header">
                    <span className="task-type">{type}</span>
                    <span className={`urgency-badge ${urgency.level}`}>
                        {urgency.label}
                    </span>
                </div>

                <h3 className="task-title">{title}</h3>

                <div className="task-meta">
                    <span className="deadline">
                        Due: {new Date(deadline).toLocaleDateString('en-IN')}
                    </span>
                    {subtasks.length > 0 && (
                        <span>
                        {completedSubtasks} / {subtasks.length} subtasks
                        </span>
                    )}
                </div>

                {subtasks.length > 0 && (
                    <div className="progress-bar-wrap">
                        <div 
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}   
                        />
                    </div>
                )}

                <div className="task-actions">
                    <button
                        onClick={() => onComplete(_id)}
                        disabled={completed}
                        className="btn-complete"
                    >
                        {completed ? 'Completed' : 'Mark as Complete'}
                    </button>
                    <button
                    onClick={() => onDelete(_id)}
                    className="btn-delete"
                    >
                        Delete
                    </button>
                </div>
            </div>
        )
}


// Pure utility function - no React, lives outside component.
// WHY outside: this function has nothing to do with rendering.
// It takes a deadline and returns urgency info. Testable in isolation.
// On Day 78, this logic moves to the ML service. Pure functions are easy to move.
function getUrgency(deadline, completed) {
    if(completed) return { level: 'none', label: 'Done' };

    const now = new Date();
    const due = new Date(deadline);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if(daysUntilDue < 0) return { level: 'high', label: 'Overdue' };
    if(daysUntilDue === 0) return { level: 'today', label: 'Due Today' };
    if(daysUntilDue <= 3) return { level: 'medium', label: 'Due Soon' }; 
    return { level: 'low', label: 'Upcoming'};
}

export default TaskCard;