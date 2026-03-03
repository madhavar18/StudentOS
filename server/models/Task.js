const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["assignment", "exam", "project"],
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },

    deadline: {
        type: Date,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

module.exports = mongoose.model("Task", taskSchema);