import React, { useState } from "react";
import studentService from "../services/studentService";
import teacherService from "../services/teacherService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("student"); // "student" or "teacher"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (userType === "student") {
      const students = await studentService.getStudents();
      const student = students.find((s) => s.email === email);

      if (student) {
        localStorage.setItem("studentId", student.id);
          localStorage.setItem("studentName", student.name);
          localStorage.setItem("userType", "student");
        navigate("/student");
        } else {
          setError("❌ Student not found. Please check your email.");
        }
      } else {
        // Teacher login
        const teacher = await teacherService.loginTeacher(email);
        if (teacher) {
          localStorage.setItem("teacherId", teacher.id);
          localStorage.setItem("teacherName", teacher.name);
          localStorage.setItem("userType", "teacher");
          navigate("/teacher");
        } else {
          setError("❌ Teacher not found. Please check your email.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 mt-5">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Welcome Back</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {/* User Type Selection */}
              <div className="mb-4">
                <label className="form-label fw-semibold">I am a:</label>
                <div className="btn-group w-100" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="userType"
                    id="student"
                    value="student"
                    checked={userType === "student"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <label className="btn btn-outline-primary" htmlFor="student">
                    👨‍🎓 Student
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="userType"
                    id="teacher"
                    value="teacher"
                    checked={userType === "teacher"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <label className="btn btn-outline-primary" htmlFor="teacher">
                    👨‍🏫 Teacher
                  </label>
                </div>
              </div>

      <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
          <input
            type="email"
                    id="email"
                    className="form-control form-control-lg"
                    placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
                    disabled={loading}
          />
        </div>

                {error && (
                  <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                  >
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
        </button>
      </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Demo: Use any {userType} email from the database
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
