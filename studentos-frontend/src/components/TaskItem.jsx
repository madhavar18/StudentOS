function TaskItem({ task, completeTask, deleteTask }) {

  const today = new Date();
  today.setHours(0,0,0,0);

  let daysLeft = null;

  if (task.deadline) {
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0,0,0,0);

    const diff = deadlineDate - today;
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  let urgencyText = "";
  let urgencyColor = "";
  let priorityColor = "border-success";

  if (daysLeft !== null) {
    if (daysLeft < 0) {
      urgencyText = `Overdue by ${Math.abs(daysLeft)} days`;
      urgencyColor = "bg-danger";
      priorityColor = "border-danger";
    } 
    else if (daysLeft === 0) {
      urgencyText = "Due Today";
      urgencyColor = "bg-warning text-dark";
      priorityColor = "border-danger";
    } 
    else if (daysLeft <= 2) {
      urgencyText = `Due in ${daysLeft} days`;
      urgencyColor = "bg-warning text-dark";
      priorityColor = "border-warning";
    } 
    else {
      urgencyText = `Due in ${daysLeft} days`;
      urgencyColor = "bg-success";
      priorityColor = "border-success";
    }
  }

  return (
    <li className={`list-group-item d-flex justify-content-between align-items-center border-start border-4 ${priorityColor}`}>

      <span>
        {task.title}

        <span className="badge bg-secondary ms-2">{task.type}</span>

        <span className={`badge ms-2 ${
          task.status === "completed"
            ? "bg-success"
            : "bg-warning text-dark"
        }`}>
          {task.status}
        </span>

        {urgencyText && (
          <span className={`badge ms-2 ${urgencyColor}`}>
            {urgencyText}
          </span>
        )}

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