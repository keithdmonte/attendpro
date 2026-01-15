// frontend/src/services/messageService.js
import axios from "axios";
import API_URL from "../config/api";

const MESSAGE_API = `${API_URL}/messages`;

// ✅ Get messages for a student
const getMessages = async (params = {}) => {
  const response = await axios.get(`${MESSAGE_API}/`, { params });
  return response.data;
};

// ✅ Get messages by student ID (convenience method)
const getMessagesByStudent = async (studentId) => {
  const response = await axios.get(`${MESSAGE_API}/`, { params: { student_id: studentId } });
  return response.data;
};

// ✅ Mark message as read (convenience method)
const markMessageAsRead = async (messageId) => {
  const response = await axios.patch(`${MESSAGE_API}/${messageId}`, { is_read: true });
  return response.data;
};

// ✅ Create a message
const createMessage = async (data) => {
  const response = await axios.post(`${MESSAGE_API}/`, data);
  return response.data;
};

// ✅ Create bulk messages (send to multiple students)
const createBulkMessages = async (data) => {
  const response = await axios.post(`${MESSAGE_API}/bulk`, data);
  return response.data;
};

// ✅ Update message (mark as read)
const updateMessage = async (messageId, data) => {
  const response = await axios.patch(`${MESSAGE_API}/${messageId}`, data);
  return response.data;
};

// ✅ Delete message
const deleteMessage = async (messageId) => {
  await axios.delete(`${MESSAGE_API}/${messageId}`);
};

export default {
  getMessages,
  getMessagesByStudent,
  createMessage,
  createBulkMessages,
  updateMessage,
  markMessageAsRead,
  deleteMessage,
};

