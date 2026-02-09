import axios from "axios";

const API = axios.create({
  baseURL: "https://task-manager-fullstack-node.onrender.com/",
});

export const getUsers = () => API.get("/users");

export const createUser = (data) => API.post("/users", data);
