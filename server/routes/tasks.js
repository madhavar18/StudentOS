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
        const newTask = new Task(req.body);

        await newTask.save();
        res.send("Task saved successfully");
    }
    catch(err) {
        res.status(500).send("Error saving task", err);
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

router.patch("/:id/complete", async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status: "completed" },
            { returnDocument: 'after' }
        );

        if(!updatedTask) {
            return res.status(404).send("Task not found");
        }

        res.json(updatedTask);
    } catch(err) {
        console.log(err);
        return res.status(500).send("Error updating task");
    }
});


module.exports = router;