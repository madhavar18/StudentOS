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

router.put("/:id", async (req, res) => {
    try {
        console.log("id: ", req.params.id);
        console.log("body: ", req.body);

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body,
            {returnDocument: 'after'}
        );
        res.json(updatedTask);
    }
    catch(err) {
        console.log(err);
        res.send("Update failed");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.send("Task deleted successfully");
    }
    catch(err) {
        console.log(err);
        res.send("Error deleting task");
    }
});

module.exports = router;