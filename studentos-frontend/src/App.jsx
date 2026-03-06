import { useEffect, useState } from "react";

function App() {

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("assignment");
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState("all");
  const [deadline, setDeadLine] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/tasks/all")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      })

      fetch("http://localhost:3000/tasks/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const createTask = async () => {
    if(!title.trim()) return alert("Title is required");
    const res = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-type" : "application/json"
      },
      body: JSON.stringify({
        title: title,
        type: type,
        deadline: deadline
      })
    });
    const data = await res.json();

    setTasks((prevTasks) =>[...tasks, data]);
    setTitle("");
    setType("assignment");
    setDeadLine("");
  };

  const completeTask = async (id) => {
    await fetch(`http://localhost:3000/tasks/${id}/complete`, {
      method: "PATCH"
    });

    setTasks((prevTasks) => 
    prevTasks.map((task) =>
    task._id === id ? { ...task, status: "completed" } : task
    )
  );
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "DELETE"
    });

    setTasks(prevTasks => 
      prevTasks.filter((task) => task._id !== id)
    )
  }

  return (
    <div className="container mt-4">

      <h1 className="text-center mb-4">StudentOS</h1>

       <div className="row mb-4">

  <div className="col">
    <div className="card p-3 text-center">
      <h5>Total Tasks</h5>
      <h3>{stats.totalTasks}</h3>
    </div>
  </div>

  <div className="col">
    <div className="card p-3 text-center">
      <h5>Completed</h5>
      <h3>{stats.completedTasks}</h3>
    </div>
  </div>

  <div className="col">
    <div className="card p-3 text-center">
      <h5>Pending</h5>
      <h3>{stats.pendingTasks}</h3>
    </div>
  </div>

</div>


      <div className="card p-3">
        <h4>Create Task</h4>

          <input
            className="form-control mb-2"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="form-control mb-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
          </select>

          <input
            type="date"
            className="form-control mb-2"
            value={deadline}
            onChange={(e) => setDeadLine(e.target.value)}
          />

          <button className="btn btn-primary" onClick={createTask}>
            Create Task
          </button>
      </div>

<div className="mb-3">

<button className="btn btn-secondary me-2" onClick={() => setFilter("all")}>
All
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("pending")}>
Pending
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("completed")}>
Completed
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("assignment")}>
Assignments
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("project")}>
Projects
</button>

<button className="btn btn-secondary" onClick={() => setFilter("exam")}>
Exams
</button>

</div>

      <div className="mt-4">
        <h4>Tasks</h4>

        <ul className="list-group">
          {tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .filter((task) => {
              if (filter === "all") return true;
              if (filter === "pending") return task.status === "pending";
              if (filter === "completed") return task.status === "completed";
              if (filter === "assignment") return task.type === "assignment";
              if (filter === "project") return task.type === "project";
              if (filter === "exam") return task.type === "exam";
            }).map((task) => {

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed";

  return (
    <li
      key={task._id}
      className={`list-group-item d-flex justify-content-between align-items-center ${
        isOverdue ? "list-group-item-danger" : ""
      }`}
    >

      <span>
        {task.title}

        <span className="badge bg-secondary ms-2">{task.type}</span>

        <span className={`badge ms-2 ${
          task.status === "completed" ? "bg-success" : "bg-warning text-dark"
        }`}>
          {task.status}</span>
        {task.deadline && (
          <span> | Due: {new Date(task.deadline).toLocaleDateString()}</span>
        )}
      </span>

      <div>
        {task.status !== "completed" && (
          <button
            className="btn btn-success btn-sm me-2"
            onClick={() => completeTask(task._id)}
          >
            Complete
          </button>
        )}

        <button
          className="btn btn-danger btn-sm"
          onClick={() => deleteTask(task._id)}
        >
          Delete
        </button>
      </div>

    </li>
  );
})}
        </ul>

      </div>

    </div>
  );
}

export default App;