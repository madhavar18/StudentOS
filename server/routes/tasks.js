const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Tasks route working");
})

router.post("/", (req, res) => {
    res.send("Task created");
})

module.exports = router;