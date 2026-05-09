// WHY a controller layer:
// Routes know WHICH function to call.
// Controllers know HOW to handle the request — validate input,
// call the right data operations, format the response.
// This separation means you can change routing without touching logic,
// and change logic without touching routing.

// For today: in-memory storage (array).
// On Day 18: this gets replaced with MongoDB/Mongoose.
// The controller interface stays identical — routes don't change.
// This is the power of separation of concerns.

let tasks = [
    {
        _id: '1',
        title: 'Complete React assignment',
        type: 'Assignment',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        priority: 'high',
        subtasks: [
            { _id: 's1', title: 'Read documentation', completed: true },
            { _id: 's2', title: 'Write components', completed: false },
            { _id: 's3', title: 'Submit on portal', completed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        _id: '2',
        title: 'Study for DBMS exam',
        type: 'Exam',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        priority: 'urgent',
        subtasks: [],
        createdAt: new Date().toISOString()
    },
    {
        _id: '3',
        title: 'Build portfolio website',
        type: 'Project',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        priority: 'medium',
        subtasks: [
            { _id: 's4', title: 'Design layout', completed: true },
            { _id: 's5', title: 'Write content', completed: true }
        ],
        createdAt: new Date().toISOString()
    }
];

// Helper to generate simple IDs (replaced by MongoDB ObjectId on Day 18)
let nextId = 4;
function generateId() { return String(nextId++); }

// ── GET ALL TASKS ─────────────────────────────────────────────────────
// GET /api/tasks
// Supports query params: ?type=Assignment&completed=false
exports.getAllTasks = (req, res) => {
    try {
        let result = [...tasks];

        // Filter by type if provided4
        if(req.query.type) {
            result = result.filter(t => 
                t.type.toLowerCase() === req.query.type.toLowerCase()
            );
        }

        // Filter by completion status if provided
        if(req.query.completed !== undefined) {
            const isCompleted = req.query.completed === 'true';
            result = result.filter(t => t.completed === isCompleted);
        }

        // Always return consistent response shape
        res.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error) {
        // next(error) would go to global error handler
        // For simple cases, inline error response is fine
        res.status(500).json({ success: false, error: 'Failed to fetch tasks'});
    }
};

// ── GET ONE TASK ──────────────────────────────────────────────────────
// GET /api/tasks/:id
exports.getTaskById = (req, res) => {
    const task = tasks.find(t => t._id === req.params.id);

    if(!task) {
        // 404: resource not found - specific, actionable error message
        return res.status(404).json({
            success: false,
            error: `Task with id '${req.params.id}' not found`
        });
    }

    res.json({ success: true, data: task });
};

// ── CREATE TASK ───────────────────────────────────────────────────────
// POST /api/tasks
// Body: { title, type, deadline, priority }
exports.createTask = (req, res) => {
    const { title, type, deadline, priority } = req.body;

    // Input validation — never trust client data
    // WHY validate here and not on the frontend only:
    // Anyone can call your API directly with curl or Postman.
    // Frontend validation is for UX. Backend validation is for security.
    const errors = [];
    if(!title || title.trim() === '') errors.push('Title is required');
    if(!type) errors.push('Type is required');
    if(!['Assignment', 'Exam', 'Project'].includes(type)) {errors.push('Type must be Assignment, Exam, or Project')};
    if(!deadline) errors.push('Deadline is required');
    if(deadline && isNaN(new Date(deadline).getTime())) {errors.push('Deadline must be a valid date')};

    if(errors.length > 0) {
        // 400 Bad Request - client sent iinvalid data
        return res.status(400).json({ success: false, errors });
    }

    const newTask = {
        _id: generateId(),
        title: title.trim(),
        type,
        deadline: new Date(deadline).toISOString(),
        priority: priority || 'medium',
        completed: false,
        subtasks: [],
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    // 201 Created: resource was created successfully
    // WHY 201 not 200: 200 means "OK, here's what you asked for".
    // 201 means "OK, I created something new". Different semantics.
    res.status(201).json({ success: true, data: newTask });
};

// ── UPDATE TASK ───────────────────────────────────────────────────────
// PATCH /api/tasks/:id
// Body: any subset of task fields to update
exports.updateTask = (req, res) => {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);

    if(taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: `Task with id '${req.params.id}' not found`
        });
    }

    // PATCH vs PUT:
    // PUT replaces the entire resource — you must send all fields.
    // PATCH updates only the fields you send — partial update.
    // PATCH is almost always what you want for task updates.
    // Sending ONLY the fields that changed = less data, fewer bugs.
    const allowedUpdates = ['title', 'type', 'deadline', 'priority'];
    const updates = {};
    allowedUpdates.forEach(field => {
        if(req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    // WHY spread: same immutability principle from React.
    // Create a new object with the existing task's fields + overrides.
    // In-memory this doesn't matter much, but with MongoDB it maps
    // directly to $set operations — only updating what changed.
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates};

    res.json({ success: true, data: tasks[taskIndex] });
};

// ── COMPLETE TASK ─────────────────────────────────────────────────────
// PATCH /api/tasks/:id/complete
// WHY a dedicated route instead of PATCH /api/tasks/:id with {completed: true}:
// "Completing a task" is a semantic action, not just a field update.
// In the future it might trigger: send notification, update streak,
// recalculate analytics. A dedicated route makes that extension easy.
// This is the difference between CRUD thinking and domain thinking.
exports.completeTask = (req, res) => {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);

    if(taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: `Task with id '${req.params.id}' not found`
        });
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        completed: true,
        completedAt: new Date().toISOString()
    };

    res.json({ success: true, data: tasks[taskIndex ]});
};

// ── DELETE TASK ───────────────────────────────────────────────────────
// DELETE /api/tasks/:id
exports.deleteTask = (req, res) => {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);

    if(taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: `Task with id '${req.params.id}' not found`
        });
    }

    const deleted = tasks.splice(taskIndex, 1)[0];

    // 200 with the deleted resource - client confirms what was deleted
    res.json({ success: true, data: deleted });
};

// ── SUBTASK OPERATIONS ────────────────────────────────────────────────

exports.addSubtask = (req, res) => {
    const task = tasks.find(t => t._id === req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const { title } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Subtask title is required' });
    }

    const newSubtask = {
        _id: `s${Date.now()}`,
        title: title.trim(),
        completed: false
    };

    task.subtasks.push(newSubtask);
    res.status(201).json({ success: true, data: newSubtask });
};

exports.toggleSubtask = (req, res) => {
    const task = tasks.find(t => t._id === req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const subtask = task.subtasks.find(s => s._id === req.params.subId);
    if (!subtask) return res.status(404).json({ success: false, error: 'Subtask not found' });

    subtask.completed = !subtask.completed;
    res.json({ success: true, data: subtask });
};

exports.deleteSubtask = (req, res) => {
    const task = tasks.find(t => t._id === req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const subIndex = task.subtasks.findIndex(s => s._id === req.params.subId);
    if (subIndex === -1) return res.status(404).json({ success: false, error: 'Subtask not found' });

    task.subtasks.splice(subIndex, 1);
    res.json({ success: true, message: 'Subtask deleted' });
};