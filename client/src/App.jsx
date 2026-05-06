import { useState, useEffect } from 'react';
import TaskCard from './components/tasks/TaskCard';
import './App.css';

// Simulated task data - replaced with real API call on Day 17
function fetchTasksFromAPI() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
                    _id: 'task1',
                    title: 'Complete React assignment',
                    type: 'Assignment',
                    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    completed: false,
                    subtasks: [
                        { _id: 's1', title: 'Read docs', completed: true },
                        { _id: 's2', title: 'Write code', completed: false },
                        { _id: 's3', title: 'Submit', completed: false }
                    ]
                },
                {
                    _id: 'task2',
                    title: 'Study for DBMS exam',
                    type: 'Exam',
                    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    completed: false,
                    subtasks: []
                },
                {
                    _id: 'task3',
                    title: 'Build portfolio website',
                    type: 'Project',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    completed: true,
                    subtasks: [
                        { _id: 's4', title: 'Design layout', completed: true },
                        { _id: 's5', title: 'Write content', completed: true }
                    ]
                }
      ])
    }, 600);
  });
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Load tasks once on mount - same pattern as Bank Tracker Day 12
  useEffect(() => {
    setLoading(true);
    fetchTasksFromAPI()
      .then(data => {
        // Sort by urgency immediately after loading
        // WHY here and not in render: sorting is a data operation,
        // not a display operation. The data arrives unsorted from the API.
        setTasks(sortByUrgency(data));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load tasks');
        setLoading(false);
      });
  }, []);

  // Update document title - same useEffect pattern as Bank Tracker
  useEffect(() => {
    const pending = tasks.filter(t => !t.completed).length;
    document.title = pending > 0 ? `StudentOS (${pending} pending)` : 'StudentOS';
    return () => { document.title = 'StudentOs' };
  } ,[tasks]); 

  // Derived stats - computed from tasks state, not stored seperately
  // WHY not state: same reason as Bank Tracker's totalBalance.
  // Stats are always calculable. Storing them seperately = sync problem.
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length
  };

  // Filtered tasks - derived from tasks + filter state
  const filteredTasks = tasks.filter(task => {
    if(filter === 'all') return true;
    if(filter === 'pending') return !task.completed;
    if(filter === 'completed') return task.completed;
    return task.type.toLowerCase() === filter; // assignment, exam, project
  });

  function handleComplete(taskId) {
    // Immutable update - same patter as Bank Tracker's handleDeposit
    setTasks(prev => prev.map(task =>
      task._id === taskId
        ? {...task, completed: true}
        : task
    ));
  }

  function handleDelete(taskId) {
    // filter returns new array without the deleted task
    // Same immutable pattern as Day 7's filter-for-deletion
    setTasks(prev => prev.filter(task => task._id !== taskId));
  }

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

      {/* Stats panel - derived values displayed*/}
      <div clasName="stats-row">
        {Object.entries(stats).map(([key, value]) => (
          <div className="stat-card" key={key}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{key}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {['all', 'pending', 'completed', 'assignment', 'exam', 'project'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Task grid */}
      <div className="tasks-grid">
        {filteredTasks.length === 0
          ? <p className="empty">No tasks found for this filter.</p>
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
    </div>
  );
}

// Pure utility function — no React dependency
// WHY pure: sorting logic is business logic, not UI logic.
// On Day 78, this becomes an ML-powered ranking function.
// Pure functions are easy to test, easy to replace, easy to move.
function sortByUrgency(tasks) {
    const urgencyOrder = { overdue: 0, today: 1, soon: 2, low: 3, none: 4 };
    return [...tasks].sort((a, b) => {
        const aUrgency = getUrgencyLevel(a.deadline, a.completed);
        const bUrgency = getUrgencyLevel(b.deadline, b.completed);
        return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    });
}

function getUrgencyLevel(deadline, completed) {
    if (completed) return 'none';
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'low';
}

export default App;