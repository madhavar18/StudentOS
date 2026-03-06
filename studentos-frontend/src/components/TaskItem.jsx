function TaskItem({task, completeTask, deleteTask}) {
    const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed";

  return (
    <li
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
}

export default TaskItem;