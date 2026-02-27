const express = require("express");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use("/tasks", taskRoutes);
app.get("/health", (req, res) => {
    res.send("StudentOS server up and running & deliverable")
})

app.listen(3000, () => {
    console.log("Server is running on local host port 3000");
})