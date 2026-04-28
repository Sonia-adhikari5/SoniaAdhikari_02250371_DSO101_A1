require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let tasks = [];

app.get("/todos", (req, res) => {
  res.json([]);
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/tasks", (req, res) => {
  const task = req.body.task;
  tasks.push(task);
  res.json({ message: "Task added" });
});

app.delete("/tasks/:id", (req, res) => {
  tasks.splice(req.params.id, 1);
  res.json({ message: "Task deleted" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});