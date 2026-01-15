// frontend/src/services/semesterService.js
import axios from "axios";
import API_URL from "../config/api";

const SEMESTER_API = `${API_URL}/semester`;

// ✅ End semester (archive current data and reset system)
const endSemester = async (semesterName, password) => {
  const response = await axios.post(`${SEMESTER_API}/end`, {
    semester_name: semesterName,
    password: password,
  });
  return response.data;
};

// ✅ Get semester history (all archived semesters)
const getSemesterHistory = async () => {
  const response = await axios.get(`${SEMESTER_API}/history`);
  return response.data;
};

// ✅ Get specific semester archive
const getSemesterArchive = async (archiveId) => {
  const response = await axios.get(`${SEMESTER_API}/history/${archiveId}`);
  return response.data;
};

// ✅ Verify admin password
const verifyPassword = async (password) => {
  const response = await axios.post(`${SEMESTER_API}/verify-password`, {
    password: password,
  });
  return response.data;
};

// ✅ Delete semester archive permanently
const deleteSemesterArchive = async (archiveId, password) => {
  await axios.delete(`${SEMESTER_API}/history/${archiveId}`, {
    params: { password: password },
  });
};

export default {
  endSemester,
  getSemesterHistory,
  getSemesterArchive,
  verifyPassword,
  deleteSemesterArchive,
};

