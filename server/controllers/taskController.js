// controllers/taskController.js
// Same interface as before. Routes are unchanged.
// Only this file and the removal of the in-memory array changed.
// This is what proper separation of concerns enables.

const Task = require('../models/Task');

// ── GET ALL TASKS ─────────────────────────────────────────────────────
exports.getAllTasks = async (req, res) => {
    try {
        // Build query object from request parameters
        const query = {};
        if (req.query.type) query.type = req.query.type;
        if (req.query.completed !== undefined) {
            query.completed = req.query.completed === 'true';
        }

        // Task.find(query) → returns all documents matching the query
        // No query = all documents
        // .sort({ createdAt: -1 }) → newest first (-1 = descending)
        // WHY sort in the database: sorting in JS after fetching means
        // loading all documents into memory. Database sort uses indexes = faster.
        const tasks = await Task.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── GET ONE TASK ──────────────────────────────────────────────────────
exports.getTaskById = async (req, res) => {
    try {
        // Task.findById() is shorthand for Task.findOne({ _id: id })
        // Returns null if not found — not an error, just no document
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: `Task '${req.params.id}' not found`
            });
        }

        res.json({ success: true, data: task });

    } catch (error) {
        // WHY check for CastError:
        // If req.params.id is not a valid MongoDB ObjectId format,
        // Mongoose throws a CastError before even querying the database.
        // "507f1f77bcf86cd799439011" is valid. "abc" is not.
        // We treat invalid ID format the same as not found — 404.
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                error: `No task found with id '${req.params.id}'`
            });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── CREATE TASK ───────────────────────────────────────────────────────
exports.createTask = async (req, res) => {
    try {
        const { title, type, deadline, priority, notes } = req.body;

        // new Task() creates a document instance — not saved yet
        // task.save() validates against the schema, then writes to MongoDB
        // WHY not Task.create() directly:
        // new Task() + save() lets you manipulate the document before saving.
        // Task.create() is a shorthand for both — fine for simple cases.
        // We use save() here for clarity about the two-step process.
        const task = new Task({ title, type, deadline, priority, notes });
        const saved = await task.save();

        res.status(201).json({ success: true, data: saved });

    } catch (error) {
        // Mongoose ValidationError: schema rules were violated
        // Extract all validation messages into a readable array
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── UPDATE TASK ───────────────────────────────────────────────────────
exports.updateTask = async (req, res) => {
    try {
        const allowedUpdates = ['title', 'type', 'deadline', 'priority', 'notes'];
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        // findByIdAndUpdate: find, update, return the updated document in one operation
        // { new: true } → return the document AFTER update, not before
        // { runValidators: true } → run schema validators on the update
        //   WHY needed: validators run on save() but NOT on update() by default.
        //   Without runValidators, you could update type to "InvalidType" and it would save.
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                error: `Task '${req.params.id}' not found`
            });
        }

        res.json({ success: true, data: task });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── COMPLETE TASK ─────────────────────────────────────────────────────
exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { completed: true, completedAt: new Date() },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                error: `Task '${req.params.id}' not found`
            });
        }

        res.json({ success: true, data: task });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── DELETE TASK ───────────────────────────────────────────────────────
exports.deleteTask = async (req, res) => {
    try {
        // findByIdAndDelete: find and delete in one operation, returns deleted doc
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: `Task '${req.params.id}' not found`
            });
        }

        res.json({ success: true, data: task });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ── SUBTASK OPERATIONS ────────────────────────────────────────────────
// WHY not separate routes/controllers for subtasks:
// Subtasks are embedded in tasks — they don't exist independently.
// All subtask operations go through the parent task document.

exports.addSubtask = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Subtask title is required'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Push to the embedded array and save
        // Mongoose validates the subtask against subtaskSchema before saving
        task.subtasks.push({ title: title.trim() });
        await task.save();

        // Return the newly added subtask — last element in the array
        const newSubtask = task.subtasks[task.subtasks.length - 1];
        res.status(201).json({ success: true, data: newSubtask });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.toggleSubtask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // .id() is a Mongoose helper — finds a subdocument by its _id
        // More reliable than .find() for embedded documents
        const subtask = task.subtasks.id(req.params.subId);
        if (!subtask) {
            return res.status(404).json({ success: false, error: 'Subtask not found' });
        }

        subtask.completed = !subtask.completed;
        await task.save();

        res.json({ success: true, data: subtask });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, error: 'Not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteSubtask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const subtask = task.subtasks.id(req.params.subId);
        if (!subtask) {
            return res.status(404).json({ success: false, error: 'Subtask not found' });
        }

        // .deleteOne() removes the subdocument from the embedded array
        subtask.deleteOne();
        await task.save();

        res.json({ success: true, message: 'Subtask deleted' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};