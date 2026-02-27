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

    deadline: {
        type: Date,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Task", taskSchema);