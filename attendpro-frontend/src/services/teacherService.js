// frontend/src/services/teacherService.js
import axios from "axios";
import API_URL from "../config/api";

// ✅ Get all teachers
const getTeachers = async () => {
  const response = await axios.get(`${API_URL}/teachers/`);
  return response.data;
};

// ✅ Get teacher by ID
const getTeacherById = async (id) => {
  const response = await axios.get(`${API_URL}/teachers/${id}`);
  return response.data;
};

// ✅ Create teacher
const createTeacher = async (data) => {
  const response = await axios.post(`${API_URL}/teachers/`, data);
  return response.data;
};

// ✅ Update teacher
const updateTeacher = async (id, data) => {
  const response = await axios.patch(`${API_URL}/teachers/${id}`, data);
  return response.data;
};

// ✅ Delete teacher
const deleteTeacher = async (id) => {
  await axios.delete(`${API_URL}/teachers/${id}`);
};

// ✅ Teacher login by email
const loginTeacher = async (email) => {
  const teachers = await getTeachers();
  const teacher = teachers.find((t) => t.email === email);
  return teacher;
};

// ✅ Get subjects by teacher ID
const getSubjectsByTeacher = async (teacherId) => {
  const response = await axios.get(`${API_URL}/subjects/`);
  const allSubjects = response.data;
  return allSubjects.filter((s) => s.teacher_id === teacherId);
};

// ✅ Get students by class
const getStudentsByClass = async (className) => {
  const response = await axios.get(`${API_URL}/students/`, {
    params: { class_name: className },
  });
  return response.data;
};

export default {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  getSubjectsByTeacher,
  getStudentsByClass,
};
