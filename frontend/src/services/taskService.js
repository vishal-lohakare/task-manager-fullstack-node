import api from "../api/axios";

export const getTasks = () => api.get("/tasks");

export const createTask = (title) => api.post("/tasks", { title });

export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);
