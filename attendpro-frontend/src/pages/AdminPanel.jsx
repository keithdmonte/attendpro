// frontend/src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import studentService from "../services/studentService";
import attendanceService from "../services/attendanceService";
import subjectService from "../services/subjectService";
import teacherService from "../services/teacherService";
import messageService from "../services/messageService";
import semesterService from "../services/semesterService";
import CLASSES from "../constants/classes";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("setup");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup Phase States
  const [selectedClassForSetup, setSelectedClassForSetup] = useState("");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [studentForm, setStudentForm] = useState({ roll_no: "", name: "", email: "", class_name: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", teacher_id: "", class_name: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", department: "" });
  const [editAssignmentForm, setEditAssignmentForm] = useState({ teacher_id: "", class_name: "" });

  // Attendance Viewing States
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState("");
  const [filterBySubject, setFilterBySubject] = useState("");
  const [filterByDate, setFilterByDate] = useState("");
  const [filterByStudent, setFilterByStudent] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [classAttendanceStats, setClassAttendanceStats] = useState({});

  // Low Attendance Alerts States
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [messageText, setMessageText] = useState("meet me");
  const [sendingMessages, setSendingMessages] = useState(false);

  // Semester End States
  const [showEndSemesterModal, setShowEndSemesterModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [semesterName, setSemesterName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [endingSemester, setEndingSemester] = useState(false);
  const [semesterHistory, setSemesterHistory] = useState([]);
  const [passwordError, setPasswordError] = useState("");

  // Delete Archive States
  const [showDeleteArchiveModal, setShowDeleteArchiveModal] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingArchive, setDeletingArchive] = useState(false);
  const [deletePasswordError, setDeletePasswordError] = useState("");

  // ✅ Fetch all data (excluding attendance - loaded on demand)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Only fetch essential data on initial load - attendance will be loaded when needed
        const [studentData, subjectData, teacherData] = await Promise.all([
          studentService.getStudents({ limit: 1000 }),
          subjectService.getSubjects(),
          teacherService.getTeachers(),
        ]);
        setStudents(studentData || []);
        setSubjects(subjectData || []);
        setTeachers(teacherData || []);
        setAllAttendance([]); // Initialize empty - will be loaded when class is selected
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Error details:", error.response?.data || error.message);
        setError(`Failed to load data: ${error.response?.data?.detail || error.message}. Please refresh the page.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Fetch attendance based on class and filters
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClassForAttendance) {
        setAttendance([]);
        setClassAttendanceStats({});
        return;
      }

      try {
        // Get students from selected class
        const classStudents = students.filter((s) => s.class_name === selectedClassForAttendance);
        const studentIds = classStudents.map((s) => s.id);

        if (studentIds.length === 0) {
          setAttendance([]);
          setClassAttendanceStats({});
          return;
        }

        // Build filter params
        const params = {};
        
        // Filter by student if selected
        if (filterByStudent) {
          params.student_id = parseInt(filterByStudent, 10);
        }

        // Filter by subject if selected
        if (filterBySubject) {
          params.subject_id = parseInt(filterBySubject, 10);
        }

        // Filter by date if selected
        if (filterByDate) {
          const dateStr = new Date(filterByDate).toISOString().split("T")[0];
          params.date_from = dateStr;
          params.date_to = dateStr;
        }

        // Fetch attendance on demand - fetch all pages to get complete data
        let data = [];
        let allFilteredAttendance = [];
        let page = 1;
        let hasMore = true;
        const pageSize = 200; // Max page size allowed by API
        
        // Add student filter if no specific student selected (to get class attendance)
        const fetchParams = { ...params };
        if (!filterByStudent && studentIds.length > 0) {
          // Fetch attendance for all students in the class
          // We'll filter by student IDs after fetching
        }
        
        while (hasMore) {
          try {
            const response = await attendanceService.getAttendance({
              ...fetchParams,
              page,
              page_size: pageSize,
            });
            
            if (Array.isArray(response) && response.length > 0) {
              allFilteredAttendance = allFilteredAttendance.concat(response);
              if (response.length < pageSize) {
                hasMore = false;
              } else {
                page++;
              }
            } else {
              hasMore = false;
            }
          } catch (err) {
            console.warn("Error fetching attendance page:", page, err);
            hasMore = false;
          }
        }
        
        data = allFilteredAttendance;
        
        // Filter by class students if no specific student filter
        if (!filterByStudent && studentIds.length > 0) {
          data = data.filter((a) => studentIds.includes(a.student_id));
        }

        setAttendance(data);

        // Calculate statistics per student
        const stats = {};
        classStudents.forEach((student) => {
          const studentAttendance = data.filter((a) => a.student_id === student.id);
          const totalLectures = studentAttendance.length;
          const presentCount = studentAttendance.filter((a) => a.status === "present").length;
          const percentage = totalLectures > 0 ? ((presentCount / totalLectures) * 100).toFixed(2) : 0;

          stats[student.id] = {
            student,
            totalLectures,
            presentCount,
            absentCount: studentAttendance.filter((a) => a.status === "absent").length,
            percentage: parseFloat(percentage),
          };
        });

        setClassAttendanceStats(stats);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setAttendance([]);
        setClassAttendanceStats({});
      }
    };

    fetchAttendance();
  }, [selectedClassForAttendance, filterBySubject, filterByDate, filterByStudent, students]);

  // ✅ Fetch all attendance when Low Attendance Alerts tab is active
  useEffect(() => {
    const fetchAllAttendanceForAlerts = async () => {
      if (activeTab !== "alerts" || allAttendance.length > 0) {
        return; // Only fetch if alerts tab is active and we don't have data yet
      }

      try {
        let allAttendanceData = [];
        let page = 1;
        const pageSize = 200;
        let hasMore = true;

        while (hasMore) {
          try {
            const data = await attendanceService.getAttendance({ page, page_size: pageSize });
            if (Array.isArray(data) && data.length > 0) {
              allAttendanceData = [...allAttendanceData, ...data];
              if (data.length < pageSize) {
                hasMore = false;
              } else {
                page++;
              }
            } else {
              hasMore = false;
            }
          } catch (err) {
            console.warn("Error fetching attendance page:", page, err);
            hasMore = false;
          }
        }
        setAllAttendance(allAttendanceData);
      } catch (error) {
        console.error("Error fetching all attendance for alerts:", error);
      }
    };

    fetchAllAttendanceForAlerts();
  }, [activeTab]);

  // ✅ Calculate low attendance students (<75%)
  useEffect(() => {
    const calculateLowAttendance = () => {
      const studentStats = {};

      // Group attendance by student
      allAttendance.forEach((record) => {
        const studentId = record.student_id;
        if (!studentStats[studentId]) {
          studentStats[studentId] = {
            studentId,
            totalLectures: 0,
            presentCount: 0,
          };
        }
        studentStats[studentId].totalLectures++;
        if (record.status === "present") {
          studentStats[studentId].presentCount++;
        }
      });

      // Calculate percentages and filter <75%
      const lowAttendance = [];
      Object.values(studentStats).forEach((stat) => {
        const percentage =
          stat.totalLectures > 0
            ? (stat.presentCount / stat.totalLectures) * 100
            : 0;

        if (percentage < 75 && stat.totalLectures > 0) {
          const student = students.find((s) => s.id === stat.studentId);
          if (student) {
            lowAttendance.push({
              ...student,
              attendancePercentage: percentage.toFixed(2),
              totalLectures: stat.totalLectures,
              presentCount: stat.presentCount,
            });
          }
        }
      });

      setLowAttendanceStudents(lowAttendance.sort((a, b) => parseFloat(a.attendancePercentage) - parseFloat(b.attendancePercentage)));
    };

    if (allAttendance.length > 0 && students.length > 0) {
      calculateLowAttendance();
    } else if (activeTab === "alerts" && allAttendance.length === 0 && students.length > 0) {
      // Clear low attendance if we're on alerts tab but no attendance data yet
      setLowAttendanceStudents([]);
    }
  }, [allAttendance, students, activeTab]);

  // ✅ Create Student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await studentService.createStudent(studentForm);
      const updated = await studentService.getStudents({ limit: 1000 });
      setStudents(updated);
      setShowStudentForm(false);
      setStudentForm({ roll_no: "", name: "", email: "", class_name: "" });
      alert("✅ Student created successfully!");
    } catch (error) {
      alert("❌ Error creating student: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectService.createSubject({
        ...subjectForm,
        teacher_id: parseInt(subjectForm.teacher_id, 10),
      });
      const updated = await subjectService.getSubjects();
      setSubjects(updated);
      setShowSubjectForm(false);
      setSubjectForm({ name: "", code: "", teacher_id: "", class_name: "" });
      alert("✅ Subject created successfully!");
    } catch (error) {
      alert("❌ Error creating subject: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Delete Student
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await studentService.deleteStudent(id);
      const updated = await studentService.getStudents({ limit: 1000 });
      setStudents(updated);
      alert("✅ Student deleted successfully!");
    } catch (error) {
      alert("❌ Error deleting student: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Delete Subject
  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await subjectService.deleteSubject(id);
      const updated = await subjectService.getSubjects();
      setSubjects(updated);
      alert("✅ Subject deleted successfully!");
    } catch (error) {
      alert("❌ Error deleting subject: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Create Teacher
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await teacherService.createTeacher(teacherForm);
      const updated = await teacherService.getTeachers();
      setTeachers(updated);
      setShowTeacherForm(false);
      setTeacherForm({ name: "", email: "", department: "" });
      alert("✅ Teacher created successfully!");
    } catch (error) {
      alert("❌ Error creating teacher: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Delete Teacher
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher? This will also delete all subjects assigned to them.")) return;
    try {
      await teacherService.deleteTeacher(id);
      const updated = await teacherService.getTeachers();
      setTeachers(updated);
      // Also refresh subjects as they might have been deleted
      const updatedSubjects = await subjectService.getSubjects();
      setSubjects(updatedSubjects);
      alert("✅ Teacher deleted successfully!");
    } catch (error) {
      alert("❌ Error deleting teacher: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Handle Edit Assignment
  const handleEditAssignment = (subject) => {
    setEditingAssignment(subject.id);
    setEditAssignmentForm({
      teacher_id: subject.teacher_id.toString(),
      class_name: subject.class_name || "",
    });
  };

  // ✅ Handle Update Assignment
  const handleUpdateAssignment = async (subjectId) => {
    try {
      const teacherId = parseInt(editAssignmentForm.teacher_id, 10);
      await subjectService.updateSubject(subjectId, {
        teacher_id: teacherId,
        class_name: editAssignmentForm.class_name,
      });

      const updated = await subjectService.getSubjects();
      setSubjects(updated);
      setEditingAssignment(null);
      setEditAssignmentForm({ teacher_id: "", class_name: "" });
      alert("✅ Assignment updated successfully!");
    } catch (error) {
      alert("❌ Error updating assignment: " + (error.response?.data?.detail || error.message));
    }
  };

  // ✅ Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setEditAssignmentForm({ teacher_id: "", class_name: "" });
  };

  // ✅ Send messages to low attendance students
  const handleSendMessages = async () => {
    if (lowAttendanceStudents.length === 0) {
      alert("No students with low attendance to message.");
      return;
    }

    if (!window.confirm(`Send message "${messageText}" to ${lowAttendanceStudents.length} students?`)) {
      return;
    }

    try {
      setSendingMessages(true);
      const studentIds = lowAttendanceStudents.map((s) => s.id);
      await messageService.createBulkMessages({
        student_ids: studentIds,
        message: messageText,
        sender_type: "admin",
      });
      alert(`✅ Messages sent successfully to ${lowAttendanceStudents.length} students!`);
    } catch (error) {
      alert("❌ Error sending messages: " + (error.response?.data?.detail || error.message));
    } finally {
      setSendingMessages(false);
    }
  };

  // ✅ Helper functions
  const getSubjectName = (id) => {
    const sub = subjects.find((s) => s.id === id);
    return sub ? `${sub.name}${sub.code ? ` (${sub.code})` : ""}` : `Subject #${id}`;
  };


  // ✅ Get students by class
  const getStudentsByClass = (className) => {
    return students.filter((s) => s.class_name === className);
  };

  // ✅ Get subjects by class
  const getSubjectsByClass = (className) => {
    return subjects.filter((s) => s.class_name === className);
  };

  // ✅ Fetch semester history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await semesterService.getSemesterHistory();
        setSemesterHistory(history || []);
      } catch (error) {
        console.error("Error fetching semester history:", error);
      }
    };
    fetchHistory();
  }, []);

  // ✅ Handle password verification and proceed to semester end modal
  const handlePasswordSubmit = async () => {
    if (!adminPassword.trim()) {
      setPasswordError("⚠️ Please enter your password");
      return;
    }

    try {
      setPasswordError("");
      // Verify password first
      await semesterService.verifyPassword(adminPassword);
      
      // Password verified, show semester end modal
      setShowPasswordModal(false);
      setShowEndSemesterModal(true);
      // Keep password in state for final submission
    } catch (error) {
      console.error("Password verification error:", error);
      setPasswordError(error.response?.data?.detail || "Invalid password. Please try again.");
      setAdminPassword(""); // Clear password on error
    }
  };

  // ✅ Handle end semester
  const handleEndSemester = async () => {
    if (!semesterName.trim()) {
      alert("⚠️ Please enter a semester name (e.g., 'Fall 2024', 'Spring 2025')");
      return;
    }

    if (!adminPassword.trim()) {
      setPasswordError("⚠️ Password is required");
      return;
    }

    try {
      setEndingSemester(true);
      setPasswordError("");
      
      const archive = await semesterService.endSemester(semesterName.trim(), adminPassword);
      
      // Refresh semester history
      const history = await semesterService.getSemesterHistory();
      setSemesterHistory(history || []);
      
      // Clear all local state
      setStudents([]);
      setSubjects([]);
      setAllAttendance([]);
      setAttendance([]);
      setClassAttendanceStats({});
      setLowAttendanceStudents([]);
      
      // Close modals and reset forms
      setShowEndSemesterModal(false);
      setShowPasswordModal(false);
      setSemesterName("");
      setAdminPassword("");
      
      alert(
        `✅ Semester "${archive.semester_name}" ended successfully!\n\n` +
        `Archived:\n` +
        `- ${archive.total_students} students\n` +
        `- ${archive.total_subjects} subjects\n` +
        `- ${archive.total_attendance_records} attendance records\n` +
        `- ${archive.total_messages} messages\n\n` +
        `The system has been reset. You can now start setting up the new semester.`
      );
      
      // Refresh page data
      window.location.reload();
    } catch (error) {
      console.error("Error ending semester:", error);
      const errorMsg = error.response?.data?.detail || error.message;
      if (error.response?.status === 401) {
        setPasswordError(errorMsg);
        setShowEndSemesterModal(false);
        setShowPasswordModal(true);
        setAdminPassword("");
      } else {
        alert("❌ Error ending semester: " + errorMsg);
      }
    } finally {
      setEndingSemester(false);
    }
  };

  // ✅ Handle delete archive
  const handleDeleteArchive = async () => {
    if (!deletePassword.trim()) {
      setDeletePasswordError("⚠️ Please enter your password");
      return;
    }

    if (!archiveToDelete) {
      return;
    }

    try {
      setDeletingArchive(true);
      setDeletePasswordError("");

      await semesterService.deleteSemesterArchive(archiveToDelete.id, deletePassword);

      // Refresh semester history
      const history = await semesterService.getSemesterHistory();
      setSemesterHistory(history || []);

      // Close modal and reset
      setShowDeleteArchiveModal(false);
      setArchiveToDelete(null);
      setDeletePassword("");
      setDeletePasswordError("");

      alert(`✅ Semester archive "${archiveToDelete.semester_name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting archive:", error);
      if (error.response?.status === 401) {
        setDeletePasswordError(error.response.data.detail || "Invalid password. Please try again.");
      } else {
        setDeletePasswordError(error.response?.data?.detail || "Error deleting archive. Please try again.");
      }
    } finally {
      setDeletingArchive(false);
    }
  };

  if (loading) {
  return (
    <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading admin panel...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="page-background-duo">
      <div className="container container-duo">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="mb-1 heading-duo" style={{fontSize: "2.5rem"}}>⚙️ Admin Panel</h2>
            <p className="text-muted mb-0 d-none d-md-block" style={{fontSize: "1.1rem"}}>Head of Department - Complete System Management</p>
            <p className="text-muted mb-0 d-md-none" style={{fontSize: "0.9rem"}}>HOD - System Management</p>
          </div>
          <button
            className="btn btn-duo-danger btn-sm"
            onClick={() => {
              if (window.confirm("Are you absolutely sure you want to end the current semester? This action cannot be undone and will delete all current student, subject, attendance, and message data.")) {
                setShowPasswordModal(true); // Show password modal first
                setSemesterName(""); // Clear previous semester name
                setAdminPassword(""); // Clear previous password
                setPasswordError(""); // Clear previous password error
              }
            }}
          >
            <i className="bi bi-calendar-x me-1"></i>
            End Semester
          </button>
        </div>

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

        {/* Main Tabs */}
        <ul className="nav nav-tabs-duo mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "setup" ? "active" : ""}`}
            onClick={() => setActiveTab("setup")}
          >
            🎓 Setup Phase
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            📋 Assigned Teachers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            📊 View Attendance
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            ⚠️ Low Attendance Alerts
          </button>
        </li>
      </ul>

        {/* SETUP PHASE TAB */}
        {activeTab === "setup" && (
          <div>
            <div className="alert alert-duo-info mb-4">
              <h5 className="alert-heading">📋 Before Academic Semester Begins</h5>
              <p className="mb-0">Set up students for each class, assign subjects to classes, and assign teachers to subjects.</p>
            </div>

            {/* Class Selection */}
            <div className="card card-duo mb-4">
              <div className="card-header-duo">
                <h5 className="mb-0">Select Class</h5>
              </div>
              <div className="card-body">
        <select
                  className="form-select form-select-duo form-select form-select-duo-duo"
                value={selectedClassForSetup}
                onChange={(e) => setSelectedClassForSetup(e.target.value)}
        >
                <option value="">-- Select Class --</option>
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
            </option>
          ))}
        </select>
            </div>
      </div>

          {/* Students Management */}
          <div className="card card-duo mb-4">
            <div className="card-header-duo-blue d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👨‍🎓 Students for {selectedClassForSetup || "All Classes"}</h5>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setShowStudentForm(!showStudentForm);
                  if (!showStudentForm) {
                    setStudentForm({ ...studentForm, class_name: selectedClassForSetup });
                  }
                }}
              >
                {showStudentForm ? "❌ Cancel" : "+ Add Student"}
              </button>
            </div>
            {showStudentForm && (
              <div className="card-body border-bottom">
                <form onSubmit={handleCreateStudent}>
                  <div className="row">
                    <div className="col-md-3">
                      <label className="form-label">Roll Number</label>
                      <input
                        type="text"
                        className="form-control form-control-duo"
                        value={studentForm.roll_no}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, roll_no: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control form-control-duo"
                        value={studentForm.name}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-duo"
                        value={studentForm.email}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Class</label>
        <select
          className="form-select form-select-duo"
                        value={studentForm.class_name}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, class_name: e.target.value })
                        }
                        required
        >
                        <option value="">-- Select Class --</option>
                        {CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
            </option>
          ))}
        </select>
      </div>
          </div>
                  <button type="submit" className="btn btn-duo-success mt-3">
                    Create Student
                  </button>
                </form>
              </div>
            )}
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Class</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedClassForSetup
                      ? getStudentsByClass(selectedClassForSetup)
                      : students
                    ).map((s) => (
                      <tr key={s.id}>
                        <td>{s.roll_no}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {s.class_name || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteStudent(s.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Subjects Management */}
          <div className="card card-duo mb-4">
            <div className="card-header-duo-blue d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📚 Subjects for {selectedClassForSetup || "All Classes"}</h5>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setShowSubjectForm(!showSubjectForm);
                  if (!showSubjectForm) {
                    setSubjectForm({ ...subjectForm, class_name: selectedClassForSetup });
                  }
                }}
              >
                {showSubjectForm ? "❌ Cancel" : "+ Add Subject"}
              </button>
            </div>
            {showSubjectForm && (
              <div className="card-body border-bottom">
                <form onSubmit={handleCreateSubject}>
                  <div className="row">
                    <div className="col-md-3">
                      <label className="form-label">Subject Name</label>
                      <input
                        type="text"
                        className="form-control form-control-duo"
                        value={subjectForm.name}
                        onChange={(e) =>
                          setSubjectForm({ ...subjectForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Subject Code</label>
                      <input
                        type="text"
                        className="form-control form-control-duo"
                        value={subjectForm.code}
                        onChange={(e) =>
                          setSubjectForm({ ...subjectForm, code: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Class</label>
                      <select
                        className="form-select form-select-duo"
                        value={subjectForm.class_name}
                        onChange={(e) =>
                          setSubjectForm({ ...subjectForm, class_name: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Select Class --</option>
                        {CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Teacher</label>
                      <select
                        className="form-select form-select-duo"
                        value={subjectForm.teacher_id}
                        onChange={(e) =>
                          setSubjectForm({ ...subjectForm, teacher_id: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-duo-success mt-3">
                    Create Subject
                  </button>
                </form>
              </div>
            )}
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Class</th>
                      <th>Teacher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedClassForSetup
                      ? getSubjectsByClass(selectedClassForSetup)
                      : subjects
                    ).map((sub) => {
                      const teacher = teachers.find((t) => t.id === sub.teacher_id);
                      return (
                        <tr key={sub.id}>
                          <td>{sub.id}</td>
                          <td>{sub.name}</td>
                          <td>{sub.code}</td>
                          <td>
                            <span className="badge badge-duo-info">
                              {sub.class_name || "N/A"}
                            </span>
                          </td>
                          <td>{teacher ? teacher.name : `Teacher #${sub.teacher_id}`}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteSubject(sub.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Teachers Management */}
          <div className="card card-duo mb-4">
            <div className="card-header-duo-blue d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👨‍🏫 Teachers Management</h5>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowTeacherForm(!showTeacherForm)}
              >
                {showTeacherForm ? "❌ Cancel" : "+ Add Teacher"}
              </button>
            </div>
            {showTeacherForm && (
              <div className="card-body border-bottom">
                <form onSubmit={handleCreateTeacher}>
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control form-control-duo"
                        value={teacherForm.name}
                        onChange={(e) =>
                          setTeacherForm({ ...teacherForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-duo"
                        value={teacherForm.email}
                        onChange={(e) =>
                          setTeacherForm({ ...teacherForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Department (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-duo"
                        value={teacherForm.department}
                        onChange={(e) =>
                          setTeacherForm({ ...teacherForm, department: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-duo-success mt-3">
                    Create Teacher
                  </button>
                </form>
              </div>
      )}
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.name}</td>
                        <td>{t.email}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {t.department || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTeacher(t.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="alert alert-duo-info mb-4">
            <h6 className="alert-heading">💡 Tip</h6>
            <p className="mb-0">
              <strong>To modify teacher assignments:</strong> Go to the <strong>"📋 Assigned Teachers"</strong> tab to view and edit all assignments inline.
            </p>
          </div>
        </div>
      )}

      {/* ASSIGNED TEACHERS TAB */}
      {activeTab === "assigned" && (
        <div>
          <div className="alert alert-duo-info mb-4">
            <h5 className="alert-heading">📋 Assigned Teachers</h5>
            <p className="mb-0">View and modify teacher assignments for subjects and classes. Click "Edit" on any row to change the assignment.</p>
          </div>

          <div className="card card-duo">
            <div className="card-header-duo-blue">
              <h5 className="mb-0">Current Assignments</h5>
            </div>
            <div className="card-body">
              {subjects.length === 0 ? (
                <div className="alert alert-duo-info text-center">
                  <p className="mb-0">No subjects found. Please add subjects first in the Setup Phase tab.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Subject</th>
                        <th>Subject Code</th>
                        <th>Class</th>
                        <th>Assigned Teacher</th>
                        <th>Teacher Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => {
                        const teacher = teachers.find((t) => t.id === subject.teacher_id);
                        const isEditing = editingAssignment === subject.id;
                        
            return (
                          <tr key={subject.id}>
                            <td>{subject.name}</td>
                            <td>
                              <span className="badge badge-duo-info">{subject.code}</span>
                            </td>
                            <td>
                              {isEditing ? (
                                <select
                                  className="form-select form-select-duo form-select form-select-duo-sm"
                                  value={editAssignmentForm.class_name}
                                  onChange={(e) =>
                                    setEditAssignmentForm({ ...editAssignmentForm, class_name: e.target.value })
                                  }
                                >
                                  <option value="">-- Select Class --</option>
                                  {CLASSES.map((cls) => (
                                    <option key={cls} value={cls}>
                                      {cls}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="badge badge-duo-info">
                                  {subject.class_name || "N/A"}
                  </span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <select
                                  className="form-select form-select-duo form-select form-select-duo-sm"
                                  value={editAssignmentForm.teacher_id}
                                  onChange={(e) =>
                                    setEditAssignmentForm({ ...editAssignmentForm, teacher_id: e.target.value })
                                  }
                                >
                                  <option value="">-- Select Teacher --</option>
                                  {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span>{teacher ? teacher.name : `Teacher #${subject.teacher_id}`}</span>
                              )}
                            </td>
                            <td>
                              {!isEditing && (
                                <small className="text-muted">
                                  {teacher ? teacher.email : "N/A"}
                                </small>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-duo-success"
                                    onClick={() => handleUpdateAssignment(subject.id)}
                                    disabled={!editAssignmentForm.teacher_id || !editAssignmentForm.class_name}
                                  >
                                    ✓ Save
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={handleCancelEdit}
                                  >
                                    ✗ Cancel
                                  </button>
              </div>
                              ) : (
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleEditAssignment(subject)}
                                >
                                  ✏️ Edit
                                </button>
                              )}
                            </td>
                          </tr>
            );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE VIEWING TAB */}
      {activeTab === "attendance" && (
        <div>
          {/* Class Selection (Default) */}
          <div className="card card-duo mb-4">
            <div className="card-header-duo-blue">
              <h5 className="mb-0">Select Class</h5>
            </div>
            <div className="card-body">
              <select
                className="form-select form-select-duo"
                value={selectedClassForAttendance}
                onChange={(e) => {
                  setSelectedClassForAttendance(e.target.value);
                  setFilterBySubject("");
                  setFilterByDate("");
                  setFilterByStudent("");
                }}
              >
                <option value="">-- Select Class --</option>
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters */}
          {selectedClassForAttendance && (
            <div className="card card-duo mb-4">
              <div className="card-header-duo-blue">
                <h5 className="mb-0">Filters</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Filter by Subject:</label>
                    <select
                      className="form-select form-select-duo"
                      value={filterBySubject}
                      onChange={(e) => setFilterBySubject(e.target.value)}
                    >
                      <option value="">All Subjects</option>
                      {subjects
                        .filter((s) => s.class_name === selectedClassForAttendance)
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} {sub.code && `(${sub.code})`}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Filter by Date:</label>
                    <input
                      type="date"
                      className="form-select form-select-duo"
                      value={filterByDate}
                      onChange={(e) => setFilterByDate(e.target.value)}
                    />
                    {filterByDate && (
                      <button
                        className="btn btn-sm btn-outline-secondary mt-2"
                        onClick={() => setFilterByDate("")}
                      >
                        Clear Date Filter
                      </button>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Filter by Student:</label>
                    <select
                      className="form-select form-select-duo"
                      value={filterByStudent}
                      onChange={(e) => setFilterByStudent(e.target.value)}
                    >
                      <option value="">All Students</option>
                      {students
                        .filter((s) => s.class_name === selectedClassForAttendance)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.roll_no} - {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Class Overall Attendance Summary */}
          {selectedClassForAttendance && Object.keys(classAttendanceStats).length > 0 && (
            <div className="card card-duo mb-4">
              <div className="card-header-duo-blue">
                <h5 className="mb-0">📊 Overall Attendance - {selectedClassForAttendance}</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Total Lectures</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(classAttendanceStats)
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((stat) => {
                          const badgeClass =
                            stat.percentage >= 75
                              ? "bg-success"
                              : stat.percentage >= 50
                              ? "bg-warning text-dark"
                              : "bg-danger";
                          return (
                            <tr key={stat.student.id}>
                              <td>{stat.student.roll_no}</td>
                              <td>{stat.student.name}</td>
                              <td>{stat.totalLectures}</td>
                              <td>
                                <span className="badge badge-duo-success">{stat.presentCount}</span>
                              </td>
                              <td>
                                <span className="badge badge-duo-danger">{stat.absentCount}</span>
                              </td>
                              <td>
                                <strong>{stat.percentage}%</strong>
                              </td>
                              <td>
                                <span className={`badge ${badgeClass}`}>
                                  {stat.percentage >= 75
                                    ? "Good"
                                    : stat.percentage >= 50
                                    ? "Fair"
                                    : "Poor"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
        </div>
      )}

      {/* Attendance Records Table */}
          {selectedClassForAttendance && attendance.length > 0 && (
            <div className="card card-duo">
              <div className="card-header-duo-blue d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📝 Attendance Records</h5>
                <small className="text-muted">
                  {attendance.length} record{attendance.length !== 1 ? "s" : ""} found
                </small>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                <tr>
                        <th>Student</th>
                  <th>Date</th>
                        <th>Time</th>
                  <th>Subject</th>
                        <th>Lecture Type</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                      {attendance
                        .sort((a, b) => {
                          const dateCompare = new Date(b.date) - new Date(a.date);
                          if (dateCompare !== 0) return dateCompare;
                          return b.id - a.id;
                        })
                        .map((a) => {
                          const student = students.find((s) => s.id === a.student_id);
                          return (
                  <tr key={a.id}>
                              <td>
                                <strong>{student ? student.roll_no : `#${a.student_id}`}</strong>
                                <br />
                                <small className="text-muted">
                                  {student ? student.name : "Unknown"}
                                </small>
                              </td>
                              <td>{new Date(a.date).toLocaleDateString()}</td>
                              <td>
                                {a.time
                                  ? new Date(`2000-01-01T${a.time}`).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </td>
                    <td>{getSubjectName(a.subject_id)}</td>
                              <td>
                                {a.lecture_type ? (
                                  <span className="badge badge-duo-info text-dark">
                                    {a.lecture_type}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                    <td>
                      <span
                        className={`badge ${
                          a.status === "present"
                            ? "bg-success"
                            : a.status === "absent"
                            ? "bg-danger"
                                      : a.status === "late"
                                      ? "bg-warning text-dark"
                                      : "bg-info text-dark"
                        }`}
                      >
                                  {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{a.remarks || "-"}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedClassForAttendance && attendance.length === 0 && (
            <div className="alert alert-duo-info text-center">
              <p className="mb-0">
                No attendance records found for {selectedClassForAttendance}
                {filterBySubject && ` in selected subject`}
                {filterByDate && ` on selected date`}
                {filterByStudent && ` for selected student`}
                .
              </p>
            </div>
          )}

          {/* No Class Selected */}
          {!selectedClassForAttendance && (
            <div className="alert alert-duo-warning text-center">
              <p className="mb-0">Please select a class to view attendance.</p>
            </div>
          )}
        </div>
      )}

      {/* LOW ATTENDANCE ALERTS TAB */}
      {activeTab === "alerts" && (
        <div>
          <div className="alert alert-duo-warning mb-4">
            <h5 className="alert-heading">⚠️ Low Attendance Alert</h5>
            <p className="mb-0">Students with attendance below 75% are listed below. You can send them a message directly.</p>
          </div>

          <div className="card card-duo mb-4">
            <div className="card-header-duo-danger d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Low Attendance Students ({lowAttendanceStudents.length})
              </h5>
              {lowAttendanceStudents.length > 0 && (
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="text"
                    className="form-control form-control-duo form-control form-control-duo-sm"
                    style={{ width: "200px" }}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message text"
                  />
                  <button
                    className="btn btn-light btn-sm"
                    onClick={handleSendMessages}
                    disabled={sendingMessages || !messageText.trim()}
                  >
                    {sendingMessages ? "Sending..." : `Send to All (${lowAttendanceStudents.length})`}
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              {lowAttendanceStudents.length === 0 ? (
                <div className="alert alert-duo-success text-center">
                  <p className="mb-0">🎉 Great! No students with low attendance (&lt;75%).</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Class</th>
                        <th>Total Lectures</th>
                        <th>Present</th>
                        <th>Attendance %</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowAttendanceStudents.map((student) => (
                        <tr key={student.id}>
                          <td>{student.roll_no}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {student.class_name || "N/A"}
                            </span>
                          </td>
                          <td>{student.totalLectures}</td>
                          <td>{student.presentCount}</td>
                          <td>
                            <span className={`badge ${parseFloat(student.attendancePercentage) < 50 ? "bg-danger" : "bg-warning text-dark"}`}>
                              {student.attendancePercentage}%
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={async () => {
                                try {
                                  await messageService.createMessage({
                                    student_id: student.id,
                                    message: messageText || "meet me",
                                    sender_type: "admin",
                                  });
                                  alert(`✅ Message sent to ${student.name}!`);
                                } catch (error) {
                                  alert("❌ Error sending message: " + (error.response?.data?.detail || error.message));
                                }
                              }}
                            >
                              📤 Send Message
                            </button>
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

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-duo">
              <div className="modal-header-duo-danger">
                <h5 className="modal-title">
                  <i className="bi bi-shield-lock me-2"></i>
                  Verify Password
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setAdminPassword("");
                    setPasswordError("");
                  }}
                  disabled={endingSemester}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-duo-info">
                  <strong>🔒 Security Check:</strong> Please enter your admin password to proceed with ending the semester.
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Admin Password:
                  </label>
                  <input
                    type="password"
                    className={`form-control form-control-duo ${passwordError ? "is-invalid" : ""}`}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter your password"
                    disabled={endingSemester}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  {passwordError && (
                    <div className="invalid-feedback d-block">
                      {passwordError}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                  <button
                  type="button"
                  className="btn btn-duo-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setAdminPassword("");
                    setPasswordError("");
                  }}
                  disabled={endingSemester}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-duo-primary"
                  onClick={handlePasswordSubmit}
                  disabled={endingSemester || !adminPassword.trim()}
                >
                  Verify & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Semester Modal */}
      {showEndSemesterModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-duo">
              <div className="modal-header-duo-danger">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  End Semester
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowEndSemesterModal(false);
                    setSemesterName("");
                    setAdminPassword("");
                    setPasswordError("");
                  }}
                  disabled={endingSemester}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-duo-warning">
                  <strong>⚠️ Warning:</strong> This action will permanently delete all current semester data:
                  <ul className="mb-0 mt-2">
                    <li><strong>{students.length}</strong> students</li>
                    <li><strong>{subjects.length}</strong> subjects</li>
                    <li><strong>{allAttendance.length}</strong> attendance records</li>
                    <li>All messages</li>
                  </ul>
                  <p className="mb-0 mt-2">
                    <strong>Note:</strong> Teachers will be preserved. All data will be archived with the semester name you provide.
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Semester Name (e.g., "Fall 2024", "Spring 2025"):
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-duo"
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                    placeholder="Enter semester name"
                    disabled={endingSemester}
                    autoFocus
                  />
                </div>
                {passwordError && (
                  <div className="alert alert-duo-danger">
                    {passwordError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                  <button
                  type="button"
                  className="btn btn-duo-secondary"
                  onClick={() => {
                    setShowEndSemesterModal(false);
                    setSemesterName("");
                    setAdminPassword("");
                    setPasswordError("");
                  }}
                  disabled={endingSemester}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-duo-danger"
                  onClick={handleEndSemester}
                  disabled={endingSemester || !semesterName.trim()}
                >
                  {endingSemester ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Ending Semester...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      End Semester
        </>
      )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Semester History Card */}
      {semesterHistory.length > 0 && (
        <div className="card card-duo mt-4 border-info">
          <div className="card-header bg-info bg-opacity-10">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Semester History
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Semester Name</th>
                    <th>Archived At</th>
                    <th className="text-center">Students</th>
                    <th className="text-center">Subjects</th>
                    <th className="text-center">Attendance Records</th>
                    <th className="text-center">Messages</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterHistory.map((archive) => (
                    <tr key={archive.id}>
                      <td>
                        <strong>{archive.semester_name}</strong>
                      </td>
                      <td>
                        {new Date(archive.archived_at).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-duo-info">{archive.total_students}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-duo-info text-dark">{archive.total_subjects}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-duo-success">{archive.total_attendance_records}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-duo-warning text-dark">{archive.total_messages}</span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-duo-danger btn-sm"
                          onClick={() => {
                            setArchiveToDelete(archive);
                            setDeletePassword("");
                            setDeletePasswordError("");
                            setShowDeleteArchiveModal(true);
                          }}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Archive Confirmation Modal */}
      {showDeleteArchiveModal && archiveToDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-duo">
              <div className="modal-header-duo-danger">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Delete Semester Archive
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDeleteArchiveModal(false);
                    setArchiveToDelete(null);
                    setDeletePassword("");
                    setDeletePasswordError("");
                  }}
                  disabled={deletingArchive}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-duo-warning">
                  <strong>⚠️ Warning:</strong> This action cannot be undone. The following semester archive will be permanently deleted:
                  <ul className="mb-0 mt-2">
                    <li><strong>Semester:</strong> {archiveToDelete.semester_name}</li>
                    <li><strong>Archived:</strong> {new Date(archiveToDelete.archived_at).toLocaleString()}</li>
                    <li><strong>Students:</strong> {archiveToDelete.total_students}</li>
                    <li><strong>Subjects:</strong> {archiveToDelete.total_subjects}</li>
                    <li><strong>Attendance Records:</strong> {archiveToDelete.total_attendance_records}</li>
                    <li><strong>Messages:</strong> {archiveToDelete.total_messages}</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Admin Password:
                  </label>
                  <input
                    type="password"
                    className={`form-control form-control-duo ${deletePasswordError ? "is-invalid" : ""}`}
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeletePasswordError("");
                    }}
                    placeholder="Enter your password to confirm"
                    disabled={deletingArchive}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleDeleteArchive();
                      }
                    }}
                  />
                  {deletePasswordError && (
                    <div className="invalid-feedback d-block">
                      {deletePasswordError}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-duo-secondary"
                  onClick={() => {
                    setShowDeleteArchiveModal(false);
                    setArchiveToDelete(null);
                    setDeletePassword("");
                    setDeletePasswordError("");
                  }}
                  disabled={deletingArchive}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-duo-danger"
                  onClick={handleDeleteArchive}
                  disabled={deletingArchive || !deletePassword.trim()}
                >
                  {deletingArchive ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminPanel;
