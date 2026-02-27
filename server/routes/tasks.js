const express = require("express");
const router = express.Router();
const task = require("../models/Task");
const Task = require("../models/Task");

router.get("/all", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    }
    catch(err) {
        res.send("Error fetching tasks", err);
    }
});

router.post("/", async (req, res) => {
    try {
        const newTask = new Task({
            title: "Sample Task",
            type: "assignment"
        });

        await newTask.save();
        res.send("Task saved successfully");
    }
    catch(err) {
        res.send("Error saving task", err);
    }
});

module.exports = router;