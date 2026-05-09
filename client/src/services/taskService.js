// WHY a service layer:
// Components should never call fetch() directly.
// If your API URL changes, base URL changes, auth headers are added —
// you change ONE file (taskService.js), not every component.
// This is the same separation of concerns principle from Java's BankRepository.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// WHY import.meta.env.VITE_API_URL:
// In development: calls localhost:5000
// In production (Render/Railway): calls your deployed server URL
// You set VITE_API_URL in a .env file at the client root.
// The component never knows or cares where the server is.

// Helper to handle response parsing + error extraction consistently
async function handleResponse(response) {
    const data = await response.json();

    if(!response.ok) {
        // Extract error message from our consistent error response shape
        const message = data.errors
            ? data.errors.join(', ')
            : data.error || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data;
}

// ── TASK OPERATIONS ───────────────────────────────────────────────────

export async function fetchTasks(filters = {}) {
    // Build query string from filters object
    // { type: 'Exam', completed: false } → '?type=Exam&completed=false'
    const queryString = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    ).toString();

    const url = `${BASE_URL}/tasks${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    const result = await handleResponse(response);
    return result.data; // return just the tasks array
}

export async function fetchTaskById(id) {
    const response = await fetch(`${BASE_URL}/tasks/${id}`);
    const result = await handleResponse(response);
    return result.data;
}

export async function createTask(taskData) {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    const result = await handleResponse(response);
    return result.data;
}

export async function updateTask(id, updates) {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    const result = await handleResponse(response);
    return result.data;
}

export async function completeTask(id) {
    const response = await fetch(`${BASE_URL}/tasks/${id}/complete`, {
        method: 'PATCH'
    });
    const result = await handleResponse(response);
    return result.data;
}

export async function deleteTask(id) {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
    });
    return handleResponse(response);
}

export async function addSubtask(taskId, title) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    const result = await handleResponse(response);
    return result.data;
}

export async function toggleSubtask(taskId, subId) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/subtasks/${subId}`, {
        method: 'PATCH'
    });
    const result = await handleResponse(response);
    return result.data;
}

export async function deleteSubtask(taskId, subId) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/subtasks/${subId}`, {
        method: 'DELETE'
    });
    return handleResponse(response);
}