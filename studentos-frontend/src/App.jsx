import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

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

    setTasks((prevTasks) =>[...prevTasks, data]);
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

<TaskForm
  title={title}
  setTitle={setTitle}
  type={type}
  setType={setType}
  deadline={deadline}
  setDeadLine={setDeadLine}
  createTask={createTask}
/>

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

      <TaskList
  tasks={tasks}
  filter={filter}
  completeTask={completeTask}
  deleteTask={deleteTask}
/>

    </div>
  );
}

export default App;