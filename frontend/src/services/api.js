import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-interview-coach-backend-q6ja.onrender.com/api",
});

export default api;