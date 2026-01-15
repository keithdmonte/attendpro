// frontend/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import attendanceService from "../services/attendanceService";
import subjectService from "../services/subjectService";
import teacherService from "../services/teacherService";
import messageService from "../services/messageService";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const StudentDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());
  const [activeTab, setActiveTab] = useState("home"); // "home", "absent-history", "by-subject", "messages"

  // ✅ Get studentId from localStorage (set during login)
  const studentId = parseInt(localStorage.getItem("studentId") || "1", 10);
  const studentName = localStorage.getItem("studentName") || "Student";

  // ✅ Fetch subjects, teachers, attendance, and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [subjectsData, teachersData, attendanceData, messagesData] = await Promise.all([
          subjectService.getSubjects(),
          teacherService.getTeachers(),
          attendanceService.getAttendance({
            student_id: studentId,
          }),
          messageService.getMessagesByStudent(studentId).catch(() => []), // Fetch messages, return empty array on error
        ]);
        setSubjects(subjectsData);
        setTeachers(teachersData);
        setAttendance(attendanceData);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load attendance data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // ✅ Fetch messages periodically to check for new ones
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesData = await messageService.getMessagesByStudent(studentId);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch messages every 30 seconds to check for new admin messages
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [studentId]);

  // ✅ Filter attendance by subject when selected
  useEffect(() => {
    if (selectedSubjectId) {
      const fetchFilteredAttendance = async () => {
        try {
          setLoading(true);
          const attendanceData = await attendanceService.getAttendance({
            student_id: studentId,
            subject_id: parseInt(selectedSubjectId, 10),
          });
          setAttendance(attendanceData);
        } catch (error) {
          console.error("Error fetching filtered attendance:", error);
          setError("Failed to load attendance data.");
        } finally {
          setLoading(false);
        }
      };
      fetchFilteredAttendance();
    } else {
      // Fetch all attendance when no subject filter
      const fetchAllAttendance = async () => {
        try {
          setLoading(true);
          const attendanceData = await attendanceService.getAttendance({
            student_id: studentId,
          });
          setAttendance(attendanceData);
        } catch (error) {
          console.error("Error fetching attendance:", error);
          setError("Failed to load attendance data.");
        } finally {
          setLoading(false);
        }
      };
      fetchAllAttendance();
    }
  }, [selectedSubjectId, studentId]);

  // ✅ Helper to get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.name}${subject.code ? ` (${subject.code})` : ""}` : `Subject #${subjectId}`;
  };

  // ✅ Helper to get teacher name by teacher_id
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : "Professor";
  };

  // ✅ Get today's absent notifications
  const getTodayAbsentNotifications = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayAbsent = attendance.filter((a) => {
      const recordDate = formatDateForComparison(a.date);
      return recordDate === today && a.status === "absent";
    });

    return todayAbsent.map((record) => {
      const subject = subjects.find((s) => s.id === record.subject_id);
      const teacherName = subject ? getTeacherName(subject.teacher_id) : "Professor";
      const subjectName = subject ? subject.name : `Subject #${record.subject_id}`;
      
      // Format time
      let timeDisplay = "-";
      if (record.time) {
        try {
          const timeStr = typeof record.time === 'string' ? record.time : `${record.time}`;
          const [hours, minutes] = timeStr.split(':');
          timeDisplay = `${hours}:${minutes}`;
        } catch (e) {
          timeDisplay = "-";
        }
      }

      return {
        id: record.id,
        date: record.date,
        time: timeDisplay,
        lectureType: record.lecture_type || "Lecture",
        subjectId: record.subject_id,
        subjectName: subjectName,
        teacherName: teacherName,
        remarks: record.remarks || null,
      };
    });
  };

  // ✅ Get absent history (ALL absent records for future reference)
  const getAbsentHistory = () => {
    const absentRecords = attendance
      .filter((a) => a.status === "absent")
      .sort((a, b) => {
        // Sort by date (most recent first), then by time if same date
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        
        // If same date, sort by time (if available)
        if (a.time && b.time) {
          const timeA = typeof a.time === 'string' ? a.time : `${a.time}`;
          const timeB = typeof b.time === 'string' ? b.time : `${b.time}`;
          return timeB.localeCompare(timeA);
        }
        return 0;
      }); // Show ALL absent records - no limit

    return absentRecords.map((record) => {
      const subject = subjects.find((s) => s.id === record.subject_id);
      const teacherName = subject ? getTeacherName(subject.teacher_id) : "Professor";
      const subjectName = subject ? subject.name : `Subject #${record.subject_id}`;
      
      // Format time
      let timeDisplay = "-";
      if (record.time) {
        try {
          const timeStr = typeof record.time === 'string' ? record.time : `${record.time}`;
          const [hours, minutes] = timeStr.split(':');
          timeDisplay = `${hours}:${minutes}`;
        } catch (e) {
          timeDisplay = "-";
        }
      }

      return {
        id: record.id,
        date: record.date,
        time: timeDisplay,
        lectureType: record.lecture_type || "Lecture",
        subjectId: record.subject_id,
        subjectName: subjectName,
        teacherName: teacherName,
        createdAt: record.created_at,
        remarks: record.remarks || null,
      };
    }).filter(notif => !dismissedNotifications.has(notif.id));
  };

  // ✅ Handle dismiss notification
  const handleDismissNotification = (notificationId) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  // ✅ Handle "View My Attendance" button click
  const handleViewAttendance = (subjectId) => {
    setSelectedSubjectId(subjectId.toString());
    // Scroll to attendance section
    setTimeout(() => {
      const element = document.getElementById('attendance-records-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // ✅ Helper to format date consistently (avoid timezone issues)
  const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // ✅ Helper to color calendar tiles
  const getStatusForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const record = attendance.find(
      (a) => formatDateForComparison(a.date) === dateStr
    );
    return record ? record.status : null;
  };

  // ✅ Attendance % calculation
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "present").length;
  const absentDays = attendance.filter((a) => a.status === "absent").length;
  const attendancePercentage =
    totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

  let badgeClass = "bg-success";
  if (attendancePercentage < 50) badgeClass = "bg-danger";
  else if (attendancePercentage < 75) badgeClass = "bg-warning text-dark";

  // ✅ Get attendance records for selected date
  const getRecordsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return attendance.filter(
      (a) => formatDateForComparison(a.date) === dateStr
    );
  };

  // ✅ Get attendance statistics per subject
  const getAttendanceBySubject = () => {
    const subjectStats = {};

    attendance.forEach((record) => {
      const subjectId = record.subject_id;
      if (!subjectStats[subjectId]) {
        const subject = subjects.find((s) => s.id === subjectId);
        subjectStats[subjectId] = {
          subjectId,
          subjectName: subject ? subject.name : `Subject #${subjectId}`,
          subjectCode: subject ? subject.code : "",
          totalLectures: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }

      subjectStats[subjectId].totalLectures++;
      if (record.status === "present") {
        subjectStats[subjectId].present++;
      } else if (record.status === "absent") {
        subjectStats[subjectId].absent++;
      } else if (record.status === "late") {
        subjectStats[subjectId].late++;
      } else if (record.status === "excused") {
        subjectStats[subjectId].excused++;
      }
    });

    // Calculate percentages and add to array
    return Object.values(subjectStats).map((stat) => {
      const attendancePercentage =
        stat.totalLectures > 0
          ? ((stat.present / stat.totalLectures) * 100).toFixed(2)
          : 0;

      let statusBadge = "bg-success";
      if (parseFloat(attendancePercentage) < 50) {
        statusBadge = "bg-danger";
      } else if (parseFloat(attendancePercentage) < 75) {
        statusBadge = "bg-warning text-dark";
      }

      return {
        ...stat,
        attendancePercentage: parseFloat(attendancePercentage),
        statusBadge,
      };
    }).sort((a, b) => a.subjectName.localeCompare(b.subjectName)); // Sort alphabetically
  };

  const selectedDateRecords = getRecordsForDate(selectedDate);
  const attendanceBySubject = getAttendanceBySubject();

  if (loading && attendance.length === 0) {
  return (
    <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  // ✅ Get current date and day
  const getCurrentDateAndDay = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return { dayName, dateStr };
  };

  const { dayName, dateStr } = getCurrentDateAndDay();
  const todayAbsentNotifications = getTodayAbsentNotifications();

          return (
    <div className="page-background-duo">
      <div className="container container-duo">
        {/* Header with Logout */}
        <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0 heading-duo" style={{fontSize: "2.5rem"}}>👨‍🎓 Student Dashboard</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            localStorage.removeItem("studentId");
            localStorage.removeItem("studentName");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-duo-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Menu Bar / Navigation Tabs */}
      <ul className="nav nav-tabs-duo mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            🏠 Home
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "absent-history" ? "active" : ""}`}
            onClick={() => setActiveTab("absent-history")}
          >
            📋 Absent History
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "by-subject" ? "active" : ""}`}
            onClick={() => setActiveTab("by-subject")}
          >
            📚 Attendance by Subject
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            💬 Messages
            {messages.filter(m => !m.is_read).length > 0 && (
              <span className="badge badge-duo-danger ms-2">
                {messages.filter(m => !m.is_read).length}
              </span>
            )}
          </button>
        </li>
      </ul>

      {/* HOME TAB */}
      {activeTab === "home" && (
        <div>
          {/* Greeting and Date */}
          <div className="card card-duo mb-4 bg-primary text-white">
            <div className="card-body text-center py-4">
              <h3 className="mb-2">Hello {studentName}!!</h3>
              <p className="mb-0 fs-5">
                {dayName}, {dateStr}
              </p>
            </div>
          </div>

          {/* Admin/Teacher Messages */}
          {messages.filter(m => !m.is_read).length > 0 && (
            <div className="card card-duo mb-4 border-danger">
              <div className="card-header bg-danger bg-opacity-10">
                <h5 className="mb-0">
                  <i className="bi bi-envelope-fill me-2"></i>
                  Messages from Admin/Teacher
                  <span className="badge badge-duo-danger ms-2">
                    {messages.filter(m => !m.is_read).length} New
                  </span>
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {messages
                    .filter(m => !m.is_read)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((message) => (
                      <div
                        key={message.id}
                        className="list-group-item list-group-item-action"
                        onClick={async () => {
                          try {
                            await messageService.markMessageAsRead(message.id);
                            setMessages(prev =>
                              prev.map(m =>
                                m.id === message.id ? { ...m, is_read: true } : m
                              )
                            );
                          } catch (error) {
                            console.error("Error marking message as read:", error);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              <span className="badge bg-primary me-2">
                                {message.sender_type === "admin" ? "Admin" : "Teacher"}
                              </span>
                              {message.message}
                            </h6>
                            <small className="text-muted">
                              {new Date(message.created_at).toLocaleString()}
                            </small>
                          </div>
                          <span className="badge badge-duo-danger">New</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Today's Absent Notifications */}
          <div className="card card-duo mb-4 border-warning">
            <div className="card-header-duo-orange bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-bell-fill me-2"></i>
                Absent Notifications
              </h5>
            </div>
            <div className="card-body">
              {todayAbsentNotifications.length === 0 ? (
                <div className="alert alert-duo-success text-center mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  No notifications till now for today
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Professor</th>
                        <th>Lecture Type</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAbsentNotifications.map((notification) => (
                        <tr key={notification.id}>
                          <td>{notification.time}</td>
                          <td>
                            <strong>{notification.subjectName}</strong>
                          </td>
                          <td>{notification.teacherName}</td>
                          <td>
                            <span className="badge badge-duo-info text-dark">
                              {notification.lectureType}
                            </span>
                          </td>
                          <td>
                            {notification.remarks ? (
                              <small className="text-muted">{notification.remarks}</small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Overall Attendance Percentage */}
          <div className="card card-duo">
            <div className="card-body text-center py-4">
              <h6 className="text-muted mb-3">Overall Attendance</h6>
              <div className="display-4 mb-2">
                <span className={`badge ${badgeClass}`} style={{ fontSize: "3rem", padding: "1rem 2rem" }}>
                  {attendancePercentage}%
                </span>
              </div>
              <p className="text-muted mb-0">
                Based on {totalDays} total lecture{totalDays !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
      </div>
      )}

      {/* ABSENT HISTORY TAB */}
      {activeTab === "absent-history" && (
        <div>
          {/* Absent History Box - Complete Record for Future Reference */}
          <div className="card card-duo border-warning">
            <div className="card-header-duo-orange bg-opacity-10">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Absent History
                  <span className="badge badge-duo-danger ms-2">{getAbsentHistory().length}</span>
                </h5>
                <small className="text-muted">Complete record for future reference</small>
              </div>
            </div>
            <div className="card-body">
              {getAbsentHistory().length === 0 ? (
                <div className="alert alert-duo-success text-center mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  No absent records! Great attendance!
      </div>
      ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
            <tr>
              <th>Date</th>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Professor</th>
                        <th>Lecture Type</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
                      {getAbsentHistory().map((notification) => (
                        <tr key={notification.id}>
                          <td>
                            <strong>{new Date(notification.date).toLocaleDateString()}</strong>
                          </td>
                          <td>{notification.time}</td>
                          <td>
                            <strong>{notification.subjectName}</strong>
                          </td>
                          <td>{notification.teacherName}</td>
                <td>
                            <span className="badge badge-duo-info text-dark">
                              {notification.lectureType}
                            </span>
                          </td>
                          <td>
                            {notification.remarks ? (
                              <small className="text-muted">{notification.remarks}</small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE BY SUBJECT TAB */}
      {activeTab === "by-subject" && (
        <div>
          {/* Attendance by Subject - Tabular Format */}
          {attendanceBySubject.length > 0 ? (
            <div className="card card-duo">
              <div className="card-header bg-white py-2">
                <h6 className="mb-0">📚 Attendance by Subject</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Subject</th>
                        <th className="text-center">Total Lectures</th>
                        <th className="text-center">Present</th>
                        <th className="text-center">Absent</th>
                        <th className="text-center">Late</th>
                        <th className="text-center">Excused</th>
                        <th className="text-center">Attendance %</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceBySubject.map((stat) => (
                        <tr key={stat.subjectId}>
                          <td>
                            <strong>{stat.subjectName}</strong>
                            {stat.subjectCode && (
                              <small className="text-muted d-block">
                                ({stat.subjectCode})
                              </small>
                            )}
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary">
                              {stat.totalLectures}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-duo-success">
                              {stat.present}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-duo-danger">
                              {stat.absent}
                            </span>
                          </td>
                          <td className="text-center">
                            {stat.late > 0 ? (
                              <span className="badge badge-duo-warning text-dark">
                                {stat.late}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            {stat.excused > 0 ? (
                              <span className="badge badge-duo-info text-dark">
                                {stat.excused}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            <strong>{stat.attendancePercentage}%</strong>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${stat.statusBadge}`}>
                              {stat.attendancePercentage >= 75
                                ? "Good"
                                : stat.attendancePercentage >= 50
                                ? "Fair"
                                : "Poor"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-duo-info text-center">
              <p className="mb-0">No attendance records found.</p>
            </div>
          )}
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === "messages" && (
        <div>
          <div className="card card-duo">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                💬 Message History
                {messages.filter(m => !m.is_read).length > 0 && (
                  <span className="badge badge-duo-danger ms-2">
                    {messages.filter(m => !m.is_read).length} Unread
                  </span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {messages.length === 0 ? (
                <div className="alert alert-duo-info text-center mb-0">
                  <i className="bi bi-inbox me-2"></i>
                  No messages yet.
                </div>
              ) : (
                <div className="list-group">
                  {messages
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`list-group-item list-group-item-action ${
                          !message.is_read ? "bg-light" : ""
                        }`}
                        onClick={async () => {
                          if (!message.is_read) {
                            try {
                              await messageService.markMessageAsRead(message.id);
                              setMessages(prev =>
                                prev.map(m =>
                                  m.id === message.id ? { ...m, is_read: true } : m
                                )
                              );
                            } catch (error) {
                              console.error("Error marking message as read:", error);
                            }
                          }
                        }}
                        style={{ cursor: !message.is_read ? "pointer" : "default" }}
                      >
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <span className={`badge me-2 ${
                                message.sender_type === "admin" ? "bg-primary" : "bg-info"
                              }`}>
                                {message.sender_type === "admin" ? "Admin" : "Teacher"}
                              </span>
                              {!message.is_read && (
                                <span className="badge badge-duo-danger">New</span>
                              )}
                            </div>
                            <h6 className="mb-1">{message.message}</h6>
                            <small className="text-muted">
                              {new Date(message.created_at).toLocaleString()}
                            </small>
                          </div>
                          <div className="ms-3">
                            {message.is_read ? (
                              <i className="bi bi-check-circle-fill text-success" title="Read"></i>
                            ) : (
                              <i className="bi bi-circle text-danger" title="Unread - Click to mark as read"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentDashboard;
