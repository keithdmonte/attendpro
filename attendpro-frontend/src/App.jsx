import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";   // ⬅ import Login page
import StudentDashboard from "./pages/StudentDashboard";  
import TeacherDashboard from "./pages/TeacherDashboard"; 
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="page-background-duo">
                <div className="container container-duo">
                  <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                      <div className="text-center mb-4 mb-md-5">
                        <h1 className="display-4 fw-bold mb-2 mb-md-3 heading-duo" style={{fontSize: "clamp(2rem, 5vw, 3.5rem)"}}>
                          Welcome to AttendPro 👋
                        </h1>
                        <p className="lead text-muted px-2 px-md-0" style={{fontSize: "clamp(1rem, 2vw, 1.2rem)"}}>
                          A comprehensive attendance management system for
                          educational institutions
                        </p>
                      </div>
                      <div className="row g-3 g-md-4 mt-3 mt-md-4">
                        <div className="col-12 col-sm-6 col-md-4">
                          <div className="card card-duo h-100">
                            <div className="card-body text-center">
                              <div className="mb-2 mb-md-3">
                                <span style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>👨‍🎓</span>
                              </div>
                              <h5 className="card-title">Student Portal</h5>
                              <p className="card-text text-muted small">
                                View your attendance records and track your
                                performance
                              </p>
                              <a href="/login" className="btn btn-duo-primary w-100 w-sm-auto">
                                Access Portal
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <div className="card card-duo h-100">
                            <div className="card-body text-center">
                              <div className="mb-2 mb-md-3">
                                <span style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>👨‍🏫</span>
                              </div>
                              <h5 className="card-title">Teacher Portal</h5>
                              <p className="card-text text-muted small">
                                Mark attendance and manage your classes
                              </p>
                              <a href="/login" className="btn btn-duo-success w-100 w-sm-auto">
                                Access Portal
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <div className="card card-duo h-100">
                            <div className="card-body text-center">
                              <div className="mb-2 mb-md-3">
                                <span style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>⚙️</span>
                              </div>
                              <h5 className="card-title">Admin Panel</h5>
                              <p className="card-text text-muted small">
                                Manage students, teachers, and system settings
                              </p>
                              <a href="/login" className="btn btn-duo-secondary w-100 w-sm-auto">
                                Access Panel
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/student" 
            element={
              <ProtectedRoute userType="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />   
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute userType="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute userType="admin">
                <AdminPanel />
              </ProtectedRoute>
            } 
          /> 
        </Routes>
      </div>
    </>
  );
}

export default App;
