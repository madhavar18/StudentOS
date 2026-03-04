require("dotenv").config();

const express = require("express");
const cors  = require("cors");
const taskRoutes = require("./routes/tasks");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/tasks", taskRoutes);

app.get("/health", (req, res) => {
    res.send("StudentOS server up and running & deliverable")
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on local host port 3000");
})