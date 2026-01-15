// frontend/src/services/attendanceService.js
import axios from "axios";
import API_URL_BASE from "../config/api";

const API_URL = `${API_URL_BASE}/attendance`; // base

// ✅ List attendance with filters
const getAttendance = async (params = {}) => {
  const response = await axios.get(`${API_URL}/`, { params }); // <-- notice `/`
  return response.data;
};

// ✅ Get attendance by ID
const getAttendanceById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// ✅ Create single attendance
const createAttendance = async (data) => {
  const response = await axios.post(`${API_URL}/`, data); // <-- `/`
  return response.data;
};

// ✅ Bulk create attendance
const createBulkAttendance = async (data) => {
  const response = await axios.post(`${API_URL}/bulk`, data); // <-- correct path
  return response.data;
};

// ✅ Update attendance
const updateAttendance = async (id, data) => {
  const response = await axios.patch(`${API_URL}/${id}`, data);
  return response.data;
};

// ✅ Delete attendance
const deleteAttendance = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

export default {
  getAttendance,
  getAttendanceById,
  createAttendance,
  createBulkAttendance,
  updateAttendance,
  deleteAttendance,
};
