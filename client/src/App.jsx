import { useState, useEffect } from 'react';
import TaskCard from './components/tasks/TaskCard';
import TaskForm from './components/tasks/TaskForm';
import { fetchTasks, completeTask, deleteTask } from './services/taskService';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false); // controls form visibility

    useEffect(() => {
        setLoading(true);
        fetchTasks()
            .then(data => {
                setTasks(sortByUrgency(data));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const pending = tasks.filter(t => !t.completed).length;
        document.title = pending > 0 ? `StudentOS (${pending} pending)` : 'StudentOS';
        return () => { document.title = 'StudentOS'; };
    }, [tasks]);

    // Called when TaskForm successfully creates a task
    // WHY add to state directly instead of re-fetching all tasks:
    // Re-fetching makes an unnecessary API call — we already have the new task.
    // The server returns the complete created task object — use it directly.
    // This pattern is called "optimistic UI update":
    // update the state with what the server confirmed, no extra round trip.
    function handleTaskCreated(newTask) {
        setTasks(prev => sortByUrgency([newTask, ...prev]));
        setShowForm(false); // close the form after successful creation
    }

    async function handleComplete(taskId) {
        try {
            const updatedTask = await completeTask(taskId);
            setTasks(prev => prev.map(t =>
                t._id === taskId ? { ...t, ...updatedTask } : t
            ));
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(taskId) {
        try {
            await deleteTask(taskId);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (err) {
            setError(err.message);
        }
    }

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        overdue: tasks.filter(t =>
            !t.completed && new Date(t.deadline) < new Date()
        ).length
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return task.type.toLowerCase() === filter;
    });

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading your tasks...</p>
        </div>
    );

    return (
        <div className="app">
            <header className="app-header">
                <h1>StudentOS</h1>
                <p className="tagline">Your academic command centre</p>
            </header>

            {/* Stats */}
            <div className="stats-row">
                {Object.entries(stats).map(([key, value]) => (
                    <div className="stat-card" key={key}>
                        <span className="stat-value"
                            style={{ color: key === 'overdue' && value > 0 ? '#e74c3c' : 'inherit' }}>
                            {value}
                        </span>
                        <span className="stat-label">{key}</span>
                    </div>
                ))}
            </div>

            {/* Add task button */}
            <button
                className="add-task-btn"
                onClick={() => setShowForm(true)}
            >
                + Add Task
            </button>

            {/* Filter bar */}
            <div className="filter-bar">
                {['all','pending','completed','assignment','exam','project'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Task grid */}
            <div className="tasks-grid">
                {filteredTasks.length === 0
                    ? <p className="empty">
                        {filter === 'all'
                            ? 'No tasks yet. Click "Add Task" to create one.'
                            : `No ${filter} tasks.`}
                      </p>
                    : filteredTasks.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onComplete={handleComplete}
                            onDelete={handleDelete}
                        />
                    ))
                }
            </div>

            {/* Task form modal — conditionally rendered */}
            {/* WHY conditional rendering not CSS display:none:
                When showForm is false, TaskForm doesn't exist in the DOM.
                Its local state (formData, errors) is gone.
                Next time it opens, it starts fresh.
                With display:none, the component stays mounted —
                form data would persist between opens (usually unwanted). */}
            {showForm && (
                <TaskForm
                    onTaskCreated={handleTaskCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
}

function sortByUrgency(tasks) {
    const order = { overdue: 0, today: 1, soon: 2, low: 3, none: 4 };
    return [...tasks].sort((a, b) =>
        order[getUrgencyLevel(a)] - order[getUrgencyLevel(b)]
    );
}

function getUrgencyLevel(task) {
    if (task.completed) return 'none';
    const days = Math.ceil(
        (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'low';
}

export default App;