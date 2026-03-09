import TaskItem from "./TaskItem";

function TaskList({ tasks, filter, completeTask, deleteTask }) {


  const today = new Date();
today.setHours(0,0,0,0);

const getUrgency = (task) => {

  if(!task.deadline) return 4;

  const deadline = new Date(task.deadline);
  deadline.setHours(0,0,0,0);

  const diff = Math.ceil((deadline - today) / (1000*60*60*24));

  if(diff < 0) return 0;      // overdue
  if(diff === 0) return 1;    // today
  if(diff <= 2) return 2;     // due soon
  return 3;                   // later
};

const processedTasks = [...tasks]

.sort((a,b) => {
  const priorityDiff = getUrgency(a) - getUrgency(b);
  if(priorityDiff !== 0) return priorityDiff;

  return new Date(a.deadline || Infinity) - new Date(b.deadline || Infinity);
})

.filter((task) => {
  if (filter === "all") return true;
  if (filter === "pending") return task.status === "pending";
  if (filter === "completed") return task.status === "completed";
  if (filter === "assignment") return task.type === "assignment";
  if (filter === "project") return task.type === "project";
  if (filter === "exam") return task.type === "exam";
  return false;
});

  return (
    <div className="mt-4">
      <h4>Tasks</h4>
      {processedTasks.length === 0 ? (
        <div className="text-center mt-3">
        <p>🎉 No tasks yet</p>
        <p> Create you first task</p>
      </div>
      ):(
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
      )}
    </div>
  );
}

export default TaskList;