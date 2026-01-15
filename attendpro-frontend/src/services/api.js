import axios from "axios";
import API_URL from "../config/api";

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: API_URL, // Uses centralized API configuration
});

export default api;
