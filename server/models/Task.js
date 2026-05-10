// models/Task.js
// The Task schema defines the shape, types, validation rules,
// and default values for every task document in MongoDB.
// Mongoose enforces these rules before any document touches the database.

const mongoose = require('mongoose');

// ── SUBTASK SCHEMA ────────────────────────────────────────────────────
// WHY a separate schema for subtasks even though they're embedded:
// Defining subtask shape separately gives each subtask its own _id
// (generated automatically by Mongoose) and lets you validate subtasks
// independently. Without a schema, subtasks would be untyped subdocuments.
const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Subtask title is required'],
        trim: true,
        maxlength: [200, 'Subtask title cannot exceed 200 characters']
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    // _id: true is the default — each subtask gets its own ObjectId
    // This lets you reference specific subtasks in PATCH /tasks/:id/subtasks/:subId
    timestamps: false // subtasks don't need their own timestamps
});

// ── TASK SCHEMA ───────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [300, 'Task title cannot exceed 200 characters']
    },

    type: {
        type: String,
        required: [true, 'Task type is required'],
        enum: {
            values: ['Assignment', 'Exam', 'Project'],
            // Custom error message — tells the developer exactly what went wrong
            message: 'Type must be Assignment, Exam, or Project. Got: {VALUE}'
        }
    },

    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
        // Custom validator — not just type checking, but business rule
        validate: {
            validator: function(value) {
                // Allow past deadlines (overdue tasks are valid)
                // Just ensure it's a real date
                return value instanceof Date && !isNaN(value);
            },
            message: 'Deadline must be a valid date'
        }
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    completed: {
        type: Boolean,
        default: false
    },

    completedAt: {
        type: Date,
        default: null
        // WHY null default: absence of completedAt signals incomplete.
        // When task is completed, set this to new Date().
        // This lets you query: "tasks completed in the last 7 days"
    },

    // Embedded subtasks array — subtasks belong to their task.
    // WHY embedded vs separate collection:
    // You always fetch subtasks with their task — never independently.
    // Embedding means one database query gets everything.
    // If subtasks were a separate collection, you'd need two queries
    // or a $lookup (MongoDB's version of JOIN) — more complexity, slower.
    // Rule: embed when child documents belong to the parent and are
    // always accessed together. Separate collection when child documents
    // are accessed independently or shared across parents.
    subtasks: [subtaskSchema],

    notes: {
        type: String,
        default: '',
        maxlength: [2000, 'Notes cannot exceed 2000 characters']
    }
},{
    // timestamps: true automatically adds createdAt and updatedAt fields.
    // Mongoose manages them — you never set them manually.
    // updatedAt is updated automatically on every save() or findOneAndUpdate().
    timestamps: true 
});

// ── VIRTUAL FIELDS ────────────────────────────────────────────────────
// Virtuals are computed properties — not stored in MongoDB, computed on read.
// WHY virtuals: derived values shouldn't be stored (they go out of sync).
// Progress is always calculable from subtasks — storing it creates two
// sources of truth that can disagree.
taskSchema.virtual('progress').get(function() {
    if (this.subtasks.length === 0) return this.completed ? 100 : 0;
    const completed = this.subtasks.filter(s => s.completed).length;
    return Math.round((completed / this.subtasks.length) * 100);
});

taskSchema.virtual('urgencyLevel').get(function() {
    if (this.completed) return 'none';
    const days = Math.ceil((this.deadline - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'low';
});

// WHY toJSON with virtuals: true:
// By default, virtuals are excluded when converting a document to JSON
// (which happens when you res.json() it). This option includes them.
// Now when you send a task to the frontend, progress and urgencyLevel are included.
taskSchema.set('toJSON', { virtuals: true });

// ── MODEL ─────────────────────────────────────────────────────────────
// mongoose.model('Task', taskSchema):
// First argument 'Task' → MongoDB collection name becomes 'tasks' (pluralised, lowercased)
// Second argument → the schema to use
// Returns a Model class you use for all database operations
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;