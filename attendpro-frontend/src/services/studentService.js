// frontend/src/services/studentService.js
import axios from "axios";
import API_URL from "../config/api";

// ✅ Get all students (with optional class filter)
export const getStudents = async (params = {}) => {
  const response = await axios.get(`${API_URL}/students/`, { params });
  return response.data;
};

// ✅ Get student by ID
export const getStudentById = async (id) => {
  const response = await axios.get(`${API_URL}/students/${id}`);
  return response.data;
};

// ✅ Create student
export const createStudent = async (data) => {
  const response = await axios.post(`${API_URL}/students/`, data);
  return response.data;
};

// ✅ Update student
export const updateStudent = async (id, data) => {
  const response = await axios.patch(`${API_URL}/students/${id}`, data);
  return response.data;
};

// ✅ Delete student
export const deleteStudent = async (id) => {
  await axios.delete(`${API_URL}/students/${id}`);
};

// ✅ Get all unique classes
export const getClasses = async () => {
  const response = await axios.get(`${API_URL}/students/classes/list`);
  return response.data;
};

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getClasses,
};
