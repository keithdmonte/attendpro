// frontend/src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import teacherService from "../services/teacherService";
import attendanceService from "../services/attendanceService";
import studentService from "../services/studentService";
import subjectService from "../services/subjectService";
import CLASSES from "../constants/classes";

const TeacherDashboard = () => {
  const teacherId = parseInt(localStorage.getItem("teacherId") || "0", 10);
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // All students for class selection
  const [availableClasses, setAvailableClasses] = useState([]); // All unique classes from database
  const [attendanceRecords, setAttendanceRecords] = useState({});
  
  // Form states
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [lectureType, setLectureType] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  
  // View mode states
  const [viewMode, setViewMode] = useState("mark"); // "mark", "view", or "records"
  const [viewSubjectId, setViewSubjectId] = useState("");
  const [viewClass, setViewClass] = useState("");
  const [viewStudentId, setViewStudentId] = useState("");
  const [viewAttendance, setViewAttendance] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [submittedAttendance, setSubmittedAttendance] = useState(null); // Store submitted attendance data
  const [absentStudents, setAbsentStudents] = useState([]); // List of absent students

  // ✅ Fetch teacher's subjects and all students
  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) {
        setError("Please login first");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const [teacherSubjects, allStudentsData, classesList] = await Promise.all([
          subjectService.getSubjects({ teacher_id: teacherId }), // Get only subjects assigned to this teacher
          studentService.getStudents(),
          studentService.getClasses(), // Get all unique classes from database
        ]);
        setSubjects(teacherSubjects); // Show only subjects assigned to this teacher
        setAllStudents(allStudentsData);
        // Combine predefined classes with classes from database, remove duplicates, and sort
        const allClasses = [...new Set([...CLASSES, ...classesList])].sort();
        setAvailableClasses(allClasses);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  // ✅ Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        try {
          const classStudents = await teacherService.getStudentsByClass(selectedClass);
          setStudents(classStudents);
          setAttendanceRecords({}); // Clear previous attendance
        } catch (error) {
          console.error("Error fetching students:", error);
          setError("Failed to load students for this class.");
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // ✅ Mark attendance (present/absent)
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // ✅ Mark all students as present
  const handleMarkAllPresent = () => {
    const allPresent = {};
    students.forEach((s) => {
      allPresent[s.id] = "present";
    });
    setAttendanceRecords(allPresent);
  };

  // ✅ Mark all students as absent
  const handleMarkAllAbsent = () => {
    const allAbsent = {};
    students.forEach((s) => {
      allAbsent[s.id] = "absent";
    });
    setAttendanceRecords(allAbsent);
  };

  // ✅ Clear all attendance
  const handleClearAll = () => {
    setAttendanceRecords({});
  };

  // ✅ Submit attendance (bulk)
  const handleSubmit = async () => {
    // Validation
    if (!selectedSubjectId) {
      setError("⚠️ Please select a subject.");
      return;
    }
    if (!lectureType) {
      setError("⚠️ Please select lecture type (Practical or Theory).");
      return;
    }
    if (!selectedClass) {
      setError("⚠️ Please select a class.");
      return;
    }
    if (!date) {
      setError("⚠️ Please select a date.");
      return;
    }
    if (Object.keys(attendanceRecords).length === 0) {
      setError("⚠️ Please mark at least one student.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const records = Object.entries(attendanceRecords).map(
        ([studentId, status]) => ({
          student_id: parseInt(studentId, 10),
          status,
        })
      );

      // Format time properly (HH:MM:SS)
      const [hours, minutes] = time.split(":");
      const timeObj = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;

      const payload = {
        subject_id: parseInt(selectedSubjectId, 10),
        date,
        time: timeObj,
        lecture_type: lectureType,
        records,
      };

      console.log("Submitting attendance payload:", payload); // Debug log

      const response = await attendanceService.createBulkAttendance(payload);

      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const absent = total - present;
      const percent = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

      const selectedSubject = subjects.find((s) => s.id === parseInt(selectedSubjectId, 10));
      
      // Find absent students
      const absentList = students
        .filter((s) => attendanceRecords[s.id] === "absent")
        .map((s) => ({
          id: s.id,
          roll_no: s.roll_no,
          name: s.name,
          email: s.email,
        }));

      setSummary({
        total,
        present,
        absent,
        percent,
        subjectName: selectedSubject?.name || "Unknown",
        created: response.created,
        skipped: response.skipped,
      });

      // Store submitted attendance data (don't clear form yet)
      setSubmittedAttendance({
        subjectId: selectedSubjectId,
        subjectName: selectedSubject?.name || "Unknown",
        class: selectedClass,
        date,
        time,
        lectureType,
        total,
        present,
        absent,
      });

      // Store absent students
      setAbsentStudents(absentList);

      // Show success message
      alert(`✅ Attendance submitted successfully! Created: ${response.created}, Skipped: ${response.skipped}`);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      console.error("Error details:", error.response?.data);
      
      // Better error handling - don't let page go blank
      let errorMessage = "❌ Error submitting attendance. Please try again.";
      
      if (error.response?.data) {
        if (error.response.data.detail) {
          if (Array.isArray(error.response.data.detail)) {
            // Validation errors
            errorMessage = "Validation Error:\n" + 
              error.response.data.detail.map(err => 
                `${err.loc?.join('.')}: ${err.msg}`
              ).join('\n');
          } else {
            errorMessage = error.response.data.detail;
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
      
      // Don't clear form on error - keep everything visible
      // setAttendanceRecords({});
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Start New Lecture - Clear everything and reset form
  const handleStartNewLecture = () => {
    setAttendanceRecords({});
    setSelectedSubjectId("");
    setLectureType("");
    setSelectedClass("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("09:00");
    setSummary(null);
    setSubmittedAttendance(null);
    setAbsentStudents([]);
    setError(null);
    setStudents([]);
  };

  // ✅ Fetch attendance for viewing
  const handleViewAttendance = async () => {
    if (!viewSubjectId) {
      setError("Please select a subject to view attendance.");
      setViewAttendance([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setViewAttendance([]); // Clear previous data
      
      const params = {
        subject_id: parseInt(viewSubjectId, 10),
      };
      
      if (viewClass) {
        // Get students in class and filter attendance
        const classStudents = await teacherService.getStudentsByClass(viewClass);
        const studentIds = classStudents.map(s => s.id);
        // Note: We'll need to filter on frontend since API doesn't support multiple student_ids
        const allAttendance = await attendanceService.getAttendance(params);
        setViewAttendance(allAttendance.filter(a => studentIds.includes(a.student_id)));
      } else if (viewStudentId) {
        params.student_id = parseInt(viewStudentId, 10);
        const attendance = await attendanceService.getAttendance(params);
        setViewAttendance(attendance || []);
      } else {
        // Get all attendance for the subject
        const attendance = await attendanceService.getAttendance(params);
        setViewAttendance(attendance || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to load attendance data.";
      setError(errorMessage);
      setViewAttendance([]); // Ensure it's an empty array on error
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate attendance percentage for a specific student
  const getStudentAttendancePercentage = () => {
    if (!viewStudentId || !viewAttendance || viewAttendance.length === 0) {
      return null;
    }

    const studentRecords = viewAttendance.filter(a => a.student_id === parseInt(viewStudentId, 10));
    if (studentRecords.length === 0) {
      return null;
    }

    const totalLectures = studentRecords.length;
    const presentCount = studentRecords.filter(a => a.status === "present").length;
    const percentage = totalLectures > 0 
      ? ((presentCount / totalLectures) * 100).toFixed(1)
      : 0;

    return {
      percentage: parseFloat(percentage),
      totalLectures,
      presentCount,
      absentCount: totalLectures - presentCount
    };
  };

  // ✅ Group attendance by student (for individual student percentages)
  const getAttendanceByStudent = () => {
    if (!viewAttendance || !Array.isArray(viewAttendance) || viewAttendance.length === 0) {
      return {};
    }

    const grouped = {};
    
    try {
      viewAttendance.forEach(record => {
        if (!record || !record.student_id) return;
        
        const studentId = record.student_id;
        
        if (!grouped[studentId]) {
          grouped[studentId] = {
            records: [],
            totalLectures: 0,
            presentCount: 0,
            absentCount: 0,
          };
        }
        
        grouped[studentId].records.push(record);
        grouped[studentId].totalLectures++;
        
        if (record.status === "present") {
          grouped[studentId].presentCount++;
        } else if (record.status === "absent") {
          grouped[studentId].absentCount++;
        }
      });

      // Calculate percentages for each student
      Object.keys(grouped).forEach(studentId => {
        const stats = grouped[studentId];
        stats.attendancePercentage = stats.totalLectures > 0
          ? ((stats.presentCount / stats.totalLectures) * 100).toFixed(1)
          : 0;
      });
    } catch (error) {
      console.error("Error grouping attendance by student:", error);
      return {};
    }

    return grouped;
  };

  // ✅ Group attendance by class
  const getAttendanceByClass = () => {
    if (!viewAttendance || !Array.isArray(viewAttendance) || viewAttendance.length === 0) {
      return {};
    }

    const grouped = {};
    
    try {
      viewAttendance.forEach(record => {
        if (!record || !record.student_id) return; // Skip invalid records
        
        // Find student to get their class
        const student = allStudents.find(s => s.id === record.student_id);
        const className = student?.class_name || "Unknown";
        
        if (!grouped[className]) {
          grouped[className] = {
            records: [],
            students: new Set(),
            totalLectures: 0,
            presentCount: 0,
            absentCount: 0,
          };
        }
        
        grouped[className].records.push(record);
        grouped[className].students.add(record.student_id);
        grouped[className].totalLectures++;
        
        if (record.status === "present") {
          grouped[className].presentCount++;
        } else if (record.status === "absent") {
          grouped[className].absentCount++;
        }
      });

      // Convert sets to counts and calculate percentages
      Object.keys(grouped).forEach(className => {
        grouped[className].studentCount = grouped[className].students.size;
        grouped[className].attendancePercentage = grouped[className].totalLectures > 0
          ? ((grouped[className].presentCount / grouped[className].totalLectures) * 100).toFixed(1)
          : 0;
      });
    } catch (error) {
      console.error("Error grouping attendance by class:", error);
      return {};
    }

    return grouped;
  };

  useEffect(() => {
    if ((viewMode === "view" || viewMode === "records") && viewSubjectId) {
      handleViewAttendance();
    }
  }, [viewSubjectId, viewClass, viewStudentId, viewMode]);

  if (!teacherId) {
    return (
      <div className="container mt-4">
        <div className="alert alert-duo-warning">
          Please login as a teacher first. <a href="/login">Go to Login</a>
        </div>
      </div>
    );
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
    }

  // Error boundary - prevent blank page
  if (error && !subjects.length && !teacherId) {
    return (
      <div className="container mt-4">
        <div className="alert alert-duo-danger">
          <h5>Error Loading Dashboard</h5>
          <p>{error}</p>
          <a href="/login" className="btn btn-duo-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background-duo">
      <div className="container container-duo">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="mb-1 heading-duo" style={{fontSize: "clamp(1.75rem, 4vw, 2.5rem)"}}>📚 Teacher Dashboard</h2>
            <p className="text-muted mb-0 d-none d-md-block" style={{fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)"}}>Welcome back, {teacherName}!</p>
            <p className="text-muted mb-0 d-md-none" style={{fontSize: "0.9rem"}}>Welcome, {teacherName}!</p>
          </div>
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
          {submittedAttendance && (
            <button
              className="btn btn-duo-primary w-100 w-sm-auto"
              onClick={handleStartNewLecture}
            >
              <i className="bi bi-plus-circle me-2"></i>
              <span className="d-none d-sm-inline">Start New Lecture</span>
              <span className="d-sm-none">New Lecture</span>
            </button>
          )}
          <button
            className="btn btn-outline-secondary w-100 w-sm-auto"
            onClick={() => {
              localStorage.removeItem("teacherId");
              localStorage.removeItem("teacherName");
              localStorage.removeItem("userType");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <ul className="nav nav-tabs-duo mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${viewMode === "mark" ? "active" : ""}`}
            onClick={() => setViewMode("mark")}
          >
            ✅ Mark Attendance
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${viewMode === "view" ? "active" : ""}`}
            onClick={() => setViewMode("view")}
          >
            Attendance records
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${viewMode === "records" ? "active" : ""}`}
            onClick={() => setViewMode("records")}
          >
            View attendance
          </button>
        </li>
      </ul>

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

      {/* Summary and Absent Students Display - Show First */}
      {submittedAttendance && (
        <>
          {/* Success Summary */}
          <div className="alert alert-duo-success alert-dismissible fade show" role="alert">
            <h5 className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              ✅ Attendance Saved Successfully!
            </h5>
            <div className="row g-2 mb-2">
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Subject:</strong> <span className="d-block d-md-inline">{submittedAttendance.subjectName}</span>
              </div>
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Class:</strong> <span className="d-block d-md-inline">{submittedAttendance.class}</span>
              </div>
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Date:</strong> <span className="d-block d-md-inline">{submittedAttendance.date}</span>
              </div>
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Time:</strong> <span className="d-block d-md-inline">{submittedAttendance.time} ({submittedAttendance.lectureType})</span>
              </div>
            </div>
            <div className="row g-2">
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Total:</strong> <span className="d-block d-md-inline">{submittedAttendance.total}</span>
              </div>
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Present:</strong>{" "}
                <span className="badge badge-duo-success">{submittedAttendance.present}</span>
              </div>
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Absent:</strong>{" "}
                <span className="badge badge-duo-danger">{submittedAttendance.absent}</span>
              </div>
              <div className="col-6 col-sm-6 col-md-3">
                <strong>Attendance %:</strong>{" "}
                <span
                  className={`badge ${
                    summary && summary.percent < 50
                      ? "bg-danger"
                      : summary && summary.percent < 75
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {summary ? summary.percent : 0}%
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setSubmittedAttendance(null);
                setAbsentStudents([]);
                setSummary(null);
              }}
              aria-label="Close"
            ></button>
          </div>

          {/* Absent Students Highlighted */}
          {absentStudents.length > 0 && (
            <div className="card card-duo mb-4 border-danger">
              <div className="card-header-duo-danger">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Absent Students ({absentStudents.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absentStudents.map((student) => (
                        <tr key={student.id} className="table-danger">
                          <td>
                            <strong>{student.roll_no}</strong>
                          </td>
                          <td>
                            <strong>{student.name}</strong>
                          </td>
                          <td>{student.email}</td>
                          <td>
                            <span className="badge badge-duo-danger">Absent</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Present Students (if needed) */}
          {absentStudents.length === 0 && (
            <div className="alert alert-duo-success mb-4">
              <i className="bi bi-check-circle me-2"></i>
              <strong>Great!</strong> All students were present for this lecture.
            </div>
          )}
        </>
      )}

      {/* MARK ATTENDANCE MODE */}
      {viewMode === "mark" && (
        <>
          <div className="card card-duo mb-4">
            <div className="card-header-duo">
              <h5 className="mb-0">Mark Attendance</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Subject Selection */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Select Subject:</label>
        <select
          className="form-select form-select-duo"
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setAttendanceRecords({});
                    }}
        >
          <option value="">-- Select Subject --</option>
                    {subjects.length === 0 ? (
                      <option disabled>No subjects available</option>
                    ) : (
                      subjects.map((subj) => (
            <option key={subj.id} value={subj.id}>
                          {subj.name} {subj.code && `(${subj.code})`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Lecture Type */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Lecture Type:</label>
                  <select
                    className="form-select form-select-duo"
                    value={lectureType}
                    onChange={(e) => {
                      setLectureType(e.target.value);
                      setAttendanceRecords({});
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>

                {/* Class Selection */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Select Class:</label>
                  <select
                    className="form-select form-select-duo"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setAttendanceRecords({});
                    }}
                  >
                    <option value="">-- Select Class --</option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
            </option>
          ))}
        </select>
      </div>

                {/* Date */}
                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold">Date:</label>
                  <input
                    type="date"
                    className="form-control form-control-duo"
                    value={date}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Time */}
                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold">Time:</label>
                  <input
                    type="time"
                    className="form-control form-control-duo"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          {selectedClass && (
            <div className="card card-duo mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  Students in {selectedClass} ({students.length} students)
                </h5>
              </div>
              <div className="card-body">
      {students.length === 0 ? (
                  <div className="alert alert-duo-warning text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>No students found in {selectedClass}.</strong>
                    <p className="mb-0 mt-2">Please add students to this class in the Admin Panel.</p>
                  </div>
                ) : (
                  <>
                    {/* Quick Actions */}
                    <div className="card card-duo mb-3 border-info">
                      <div className="card-body py-2">
                        <div className="d-flex gap-2 flex-wrap align-items-center">
                          <span className="fw-semibold text-muted">Quick Actions:</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={handleMarkAllPresent}
                            disabled={submitting || students.length === 0}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            Mark All Present
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={handleMarkAllAbsent}
                            disabled={submitting || students.length === 0}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Mark All Absent
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleClearAll}
                            disabled={submitting || Object.keys(attendanceRecords).length === 0}
                          >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Clear All
                          </button>
                          <div className="ms-auto">
                            <small className="text-muted">
                              <strong>{Object.keys(attendanceRecords).length}</strong> of <strong>{students.length}</strong> marked
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Students List with Smooth Attendance Buttons */}
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "10%" }}>Roll No</th>
                            <th style={{ width: "25%" }}>Name</th>
                            <th style={{ width: "30%" }}>Email</th>
                            <th style={{ width: "35%" }} className="text-center">Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s) => {
                            const currentStatus = attendanceRecords[s.id];
                            return (
                              <tr 
                                key={s.id}
                                className={currentStatus === "present" ? "table-success" : currentStatus === "absent" ? "table-danger" : ""}
                                style={{ 
                                  transition: "background-color 0.2s ease",
                                  opacity: submitting ? 0.6 : 1
                                }}
                              >
                                <td>
                                  <strong>{s.roll_no}</strong>
                </td>
                                <td>{s.name}</td>
                                <td>
                                  <small className="text-muted">{s.email}</small>
                                </td>
                                <td className="text-center">
                                  <div className="btn-group" role="group">
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        currentStatus === "present"
                                          ? "btn-success"
                                          : "btn-outline-success"
                                      }`}
                                      onClick={() => handleAttendanceChange(s.id, "present")}
                                      disabled={submitting}
                                      style={{
                                        minWidth: "90px",
                                        transition: "all 0.2s ease",
                                        fontWeight: currentStatus === "present" ? "bold" : "normal",
                                      }}
                                    >
                                      <i className="bi bi-check-circle me-1"></i>
                                      Present
                                    </button>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        currentStatus === "absent"
                                          ? "btn-danger"
                                          : "btn-outline-danger"
                                      }`}
                                      onClick={() => handleAttendanceChange(s.id, "absent")}
                                      disabled={submitting}
                                      style={{
                                        minWidth: "90px",
                                        transition: "all 0.2s ease",
                                        fontWeight: currentStatus === "absent" ? "bold" : "normal",
                                      }}
                                    >
                                      <i className="bi bi-x-circle me-1"></i>
                                      Absent
                                    </button>
                                  </div>
                </td>
              </tr>
                            );
                          })}
          </tbody>
        </table>
                    </div>
                  </>
                )}

                {/* Submit Button Section - Always Visible When Class Selected */}
                <div className="mt-4 p-3 p-md-4 bg-light rounded border border-success border-2">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
                    <div className="w-100 w-md-auto">
                      <h5 className="mb-1 text-success fs-6 fs-md-5">
                        <i className="bi bi-check-circle me-2"></i>
                        Ready to Submit Attendance?
                      </h5>
                      <small className="text-muted d-block d-md-inline">
                        {students.length === 0 ? (
                          "⚠️ No students in this class. Add students first."
                        ) : Object.keys(attendanceRecords).length > 0 ? (
                          <>
                            ✅ <strong>{Object.keys(attendanceRecords).length}</strong> student(s) marked
                            {!selectedSubjectId && " • ⚠️ Select Subject"}
                            {!lectureType && " • ⚠️ Select Lecture Type"}
                            {!date && " • ⚠️ Select Date"}
                            {!time && " • ⚠️ Select Time"}
                          </>
                        ) : (
                          "⚠️ Please mark attendance for at least one student"
                        )}
                      </small>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                      <button
                        className="btn btn-duo-success btn-lg px-4 px-md-5 py-2 py-md-3 shadow-sm w-100 w-sm-auto"
                        onClick={handleSubmit}
                        disabled={
                          submitting ||
                          !selectedSubjectId ||
                          !lectureType ||
                          !selectedClass ||
                          !date ||
                          !time ||
                          students.length === 0 ||
                          Object.keys(attendanceRecords).length === 0
                        }
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                        }}
                      >
                        {submitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            <span className="d-none d-sm-inline">✅ Save Attendance</span>
                            <span className="d-sm-none">✅ Save</span>
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-lg px-4 w-100 w-sm-auto"
                        onClick={() => {
                          setAttendanceRecords({});
                          setError(null);
                        }}
                        disabled={submitting}
                      >
                        Clear
      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW ATTENDANCE MODE */}
      {viewMode === "view" && (
        <div>
          <div className="card card-duo mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">View Attendance</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Subject:</label>
                  <select
                    className="form-select form-select-duo"
                    value={viewSubjectId}
                    onChange={(e) => setViewSubjectId(e.target.value)}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.length === 0 ? (
                      <option disabled>No subjects available</option>
                    ) : (
                      subjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>
                          {subj.name} {subj.code && `(${subj.code})`}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Class (Optional):</label>
                  <select
                    className="form-select form-select-duo"
                    value={viewClass}
                    onChange={(e) => setViewClass(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Student (Optional):</label>
                  <select
                    className="form-select form-select-duo"
                    value={viewStudentId}
                    onChange={(e) => setViewStudentId(e.target.value)}
                  >
                    <option value="">All Students</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.roll_no} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading attendance data...</p>
            </div>
          ) : error && viewSubjectId ? (
            <div className="alert alert-duo-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {error}
            </div>
              ) : viewAttendance && viewAttendance.length > 0 ? (
            <>
              {/* Student Attendance Percentage Card - Show when viewing specific student */}
              {viewStudentId && (() => {
                const studentStats = getStudentAttendancePercentage();
                const selectedStudent = allStudents.find(s => s.id === parseInt(viewStudentId, 10));
                return studentStats ? (
                  <div className="card card-duo mb-4 border-primary">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-12 col-md-6">
                          <h5 className="mb-2">
                            <i className="bi bi-person-circle me-2"></i>
                            {selectedStudent?.name || "Student"} ({selectedStudent?.roll_no || "N/A"})
                          </h5>
                          <p className="text-muted mb-0">
                            {subjects.find(s => s.id === parseInt(viewSubjectId))?.name || "Subject"} - Attendance Summary
                          </p>
                        </div>
                        <div className="col-12 col-md-6 text-center text-md-end">
                          <div className="d-inline-block">
                            <div className="mb-2">
                              <small className="text-muted d-block">Overall Attendance</small>
                              <span
                                className={`badge ${
                                  studentStats.percentage >= 75
                                    ? "bg-success"
                                    : studentStats.percentage >= 50
                                    ? "bg-warning text-dark"
                                    : "bg-danger"
                                }`}
                                style={{ fontSize: "2rem", padding: "0.75rem 1.5rem", fontWeight: "bold" }}
                              >
                                {studentStats.percentage}%
                              </span>
                            </div>
                            <div className="d-flex justify-content-center justify-content-md-end gap-3 mt-2">
                              <small className="text-muted">
                                <span className="badge bg-success me-1">{studentStats.presentCount}</span> Present
                              </small>
                              <small className="text-muted">
                                <span className="badge bg-danger me-1">{studentStats.absentCount}</span> Absent
                              </small>
                              <small className="text-muted">
                                <span className="badge bg-secondary me-1">{studentStats.totalLectures}</span> Total
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Class-wise Summary Cards - Show when viewing all classes */}
              {!viewClass && !viewStudentId && (
                <div className="row mb-4">
                  {Object.entries(getAttendanceByClass()).map(([className, stats]) => (
                    <div key={className} className="col-md-4 mb-3">
                      <div className="card card-duo h-100 border-primary">
                        <div className="card-header-duo">
                          <h6 className="mb-0">
                            <i className="bi bi-people me-2"></i>
                            {className}
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row text-center">
                            <div className="col-6">
                              <div className="mb-2">
                                <small className="text-muted d-block">Students</small>
                                <strong className="fs-5">{stats.studentCount}</strong>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="mb-2">
                                <small className="text-muted d-block">Lectures</small>
                                <strong className="fs-5">{stats.totalLectures}</strong>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="mb-2">
                                <small className="text-muted d-block">Present</small>
                                <span className="badge badge-duo-success fs-6">{stats.presentCount}</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="mb-2">
                                <small className="text-muted d-block">Absent</small>
                                <span className="badge badge-duo-danger fs-6">{stats.absentCount}</span>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="mt-2 pt-2 border-top">
                                <small className="text-muted d-block mb-1">Attendance %</small>
                                <span
                                  className={`badge ${
                                    parseFloat(stats.attendancePercentage) >= 75
                                      ? "bg-success"
                                      : parseFloat(stats.attendancePercentage) >= 50
                                      ? "bg-warning text-dark"
                                      : "bg-danger"
                                  }`}
                                  style={{ fontSize: "1.1rem", padding: "0.5rem 1rem" }}
                                >
                                  {stats.attendancePercentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attendance Records Grouped by Class */}
              {!viewClass && !viewStudentId ? (
                // Show grouped by class when viewing all classes
                Object.entries(getAttendanceByClass()).map(([className, stats]) => (
                  <div key={className} className="card card-duo mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">
                        <i className="bi bi-book me-2"></i>
                        Class: {className}
                        <span className="badge badge-duo-info ms-2">
                          {stats.records.length} record{stats.records.length !== 1 ? 's' : ''}
                        </span>
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover table-sm">
                          <thead className="table-light">
                            <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Lecture Type</th>
                            <th>Student Name</th>
                            <th>Roll No</th>
                            <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.records.map((a) => {
                              const student = allStudents.find(s => s.id === a.student_id);
                              return (
                                <tr key={a.id}>
                                  <td>{new Date(a.date).toLocaleDateString()}</td>
                                  <td>
                                    {a.time 
                                      ? new Date(`2000-01-01T${a.time}`).toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          hour12: false 
                                        })
                                      : "-"}
                                  </td>
                                  <td>
                                    <span className="badge badge-duo-info text-dark">
                                      {a.lecture_type || "-"}
                                    </span>
                                  </td>
                                  <td><strong>{student?.name || `Student #${a.student_id}`}</strong></td>
                                  <td>{student?.roll_no || "-"}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        a.status === "present"
                                          ? "bg-success"
                                          : a.status === "absent"
                                          ? "bg-danger"
                                          : "bg-warning"
                                      }`}
                                    >
                                      {a.status.toUpperCase()}
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
                ))
              ) : (
                // Show single filtered view when class or student is selected
                <>
                  <div className="card card-duo">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        Attendance Records
                        {viewClass && <span className="badge badge-duo-info ms-2">{viewClass}</span>}
                        {viewStudentId && (
                          <span className="badge badge-duo-info ms-2">
                            {allStudents.find(s => s.id === parseInt(viewStudentId))?.name || "Student"}
                          </span>
                        )}
                      </h5>
                    </div>
                    <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Lecture Type</th>
                            <th>Student Name</th>
                            <th>Roll No</th>
                            <th>Class</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewAttendance.map((a) => {
                            const student = allStudents.find(s => s.id === a.student_id);
                            return (
                              <tr key={a.id}>
                                <td>{new Date(a.date).toLocaleDateString()}</td>
                                <td>
                                  {a.time 
                                    ? new Date(`2000-01-01T${a.time}`).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: false 
                                      })
                                    : "-"}
                                </td>
                                <td>
                                  <span className="badge badge-duo-info text-dark">
                                    {a.lecture_type || "-"}
                                  </span>
                                </td>
                                <td><strong>{student?.name || `Student #${a.student_id}`}</strong></td>
                                <td>{student?.roll_no || "-"}</td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {student?.class_name || "-"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      a.status === "present"
                                        ? "bg-success"
                                        : a.status === "absent"
                                        ? "bg-danger"
                                        : "bg-warning"
                                    }`}
                                  >
                                    {a.status.toUpperCase()}
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
                </>
              )}
            </>
          ) : viewSubjectId ? (
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No attendance records found for the selected filters.
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW ATTENDANCE RECORDS MODE */}
      {viewMode === "records" && (
        <div>
          <div className="card card-duo mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">View Attendance</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Select Subject</label>
                  <select
                    className="form-select"
                    value={viewSubjectId}
                    onChange={(e) => {
                      setViewSubjectId(e.target.value);
                      setViewClass("");
                      setViewStudentId("");
                    }}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
                {viewSubjectId && (
                  <div className="col-12 col-md-6">
                    <label className="form-label">Select Class</label>
                    <select
                      className="form-select"
                      value={viewClass}
                      onChange={(e) => {
                        setViewClass(e.target.value);
                        setViewStudentId("");
                        if (e.target.value) {
                          handleViewAttendance();
                        }
                      }}
                    >
                      <option value="">-- Select Class --</option>
                      {[...new Set(allStudents.map((s) => s.class_name))].map(
                        (className) => (
                          <option key={className} value={className}>
                            {className}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>
              {viewSubjectId && viewClass && (
                <div className="mt-3">
                  <button
                    className="btn btn-duo-primary"
                    onClick={handleViewAttendance}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>View Records
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading attendance data...</p>
            </div>
          ) : error && viewSubjectId && viewClass ? (
            <div className="alert alert-duo-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {error}
            </div>
          ) : viewSubjectId && viewClass && viewAttendance && viewAttendance.length > 0 ? (
            <div className="card card-duo">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-people-fill me-2"></i>
                  Student Attendance - {viewClass}
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  {(() => {
                    const studentStats = getAttendanceByStudent();
                    const studentsInClass = allStudents.filter(s => s.class_name === viewClass);
                    
                    return studentsInClass.map((student) => {
                      const stats = studentStats[student.id];
                      const attendancePercentage = stats ? stats.attendancePercentage : "0.0";
                      
                      return (
                        <div key={student.id} className="card border" style={{borderRadius: "12px"}}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-3">
                                <div>
                                  <h6 className="mb-1 fw-bold" style={{fontSize: "1rem"}}>
                                    {student.name}
                                  </h6>
                                  <p className="text-muted mb-0 small">
                                    Roll No: {student.roll_no}
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-3">
                                <div className="text-center">
                                  <span
                                    className={`badge ${
                                      parseFloat(attendancePercentage) >= 75
                                        ? "bg-success"
                                        : parseFloat(attendancePercentage) >= 50
                                        ? "bg-warning text-dark"
                                        : "bg-danger"
                                    }`}
                                    style={{ fontSize: "1.25rem", padding: "0.5rem 0.75rem", fontWeight: "bold" }}
                                  >
                                    {attendancePercentage}%
                                  </span>
                                </div>
                                {stats && (
                                  <div className="d-flex gap-2">
                                    <small className="text-muted">
                                      <span className="badge bg-success">{stats.presentCount}</span> P
                                    </small>
                                    <small className="text-muted">
                                      <span className="badge bg-danger">{stats.absentCount}</span> A
                                    </small>
                                    <small className="text-muted">
                                      <span className="badge bg-secondary">{stats.totalLectures}</span> T
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          ) : viewSubjectId && viewClass ? (
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No attendance records found for the selected subject and class.
            </div>
          ) : null}
        </div>
      )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
