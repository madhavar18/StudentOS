import TaskItem from "./TaskItem";

function TaskList({ tasks, filter, completeTask, deleteTask }) {

  const processedTasks = [...tasks]
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .filter((task) => {
      if (filter === "all") return true;
      if (filter === "pending") return task.status === "pending";
      if (filter === "completed") return task.status === "completed";
      if (filter === "assignment") return task.type === "assignment";
      if (filter === "project") return task.type === "project";
      if (filter === "exam") return task.type === "exam";
    });

  return (
    <div className="mt-4">
      <h4>Tasks</h4>

      <ul className="list-group">
        {processedTasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            completeTask={completeTask}
            deleteTask={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;