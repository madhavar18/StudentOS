function TaskForm({title, setTitle, type, setType, deadline, setDeadLine, createTask}) {
    return (
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
    )
}

export default TaskForm;