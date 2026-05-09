const express = require('express');
const router = express.Router();

// WHY express.Router():
// Router is a mini Express app — it handles routes for a specific resource.
// app.use('/api/tasks', taskRoutes) mounts this router at /api/tasks.
// Inside this file, routes are relative to /api/tasks.
// GET / here means GET /api/tasks in the full app.
// This lets you organise routes by resource without repeating the base path.

const taskController = require('../controllers/taskController');

// REST conventions — the URL identifies the RESOURCE, the HTTP method identifies the ACTION:
// GET    /api/tasks         → list all tasks
// POST   /api/tasks         → create a new task
// GET    /api/tasks/:id     → get one task by ID
// PUT    /api/tasks/:id     → replace a task entirely
// PATCH  /api/tasks/:id     → update specific fields of a task
// DELETE /api/tasks/:id     → delete a task

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/complete', taskController.completeTask);

// Subtask routes — nested under a specific task
// POST   /api/tasks/:id/subtasks         → add subtask
// PATCH  /api/tasks/:id/subtasks/:subId  → toggle subtask
// DELETE /api/tasks/:id/subtasks/:subId  → delete subtask
router.post('/:id/subtasks', taskController.addSubtask);
router.patch('/:id/subtasks/:subId', taskController.toggleSubtask);
router.delete('/:id/subtasks/:subId', taskController.deleteSubtask);

module.exports = router;