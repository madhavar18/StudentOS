const BASE_URL = "http://localhost:3000";

export const fetchTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks/all`);
  return res.json();
};

export const fetchStats = async () => {
  const res = await fetch(`${BASE_URL}/tasks/stats`);
  return res.json();
};

export const createTaskAPI = async (task) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });

  return res.json();
};

export const completeTaskAPI = async (id) => {
  await fetch(`${BASE_URL}/tasks/${id}/complete`, {
    method: "PATCH"
  });
};

export const deleteTaskAPI = async (id) => {
  await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE"
  });
};