// frontend/src/services/subjectService.js
import axios from "axios";
import API_URL from "../config/api";

// ✅ Get all subjects (optionally filtered by teacher_id or class_name)
const getSubjects = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.teacher_id) {
    queryParams.append('teacher_id', params.teacher_id);
  }
  if (params.class_name) {
    queryParams.append('class_name', params.class_name);
  }
  const queryString = queryParams.toString();
  const url = `${API_URL}/subjects/${queryString ? `?${queryString}` : ''}`;
  const response = await axios.get(url);
  return response.data;
};

// ✅ Get subject by ID
const getSubjectById = async (id) => {
  const response = await axios.get(`${API_URL}/subjects/${id}`);
  return response.data;
};

// ✅ Create subject
const createSubject = async (data) => {
  const response = await axios.post(`${API_URL}/subjects/`, data);
  return response.data;
};

// ✅ Update subject
const updateSubject = async (id, data) => {
  const response = await axios.patch(`${API_URL}/subjects/${id}`, data);
  return response.data;
};

// ✅ Delete subject
const deleteSubject = async (id) => {
  await axios.delete(`${API_URL}/subjects/${id}`);
};

export default {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};

