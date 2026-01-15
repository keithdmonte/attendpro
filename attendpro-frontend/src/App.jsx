import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";   // ⬅ import Login page
import StudentDashboard from "./pages/StudentDashboard";  
import TeacherDashboard from "./pages/TeacherDashboard"; 
import AdminPanel from "./pages/AdminPanel";

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
                    <div className="col-lg-10">
                      <div className="text-center mb-5">
                        <h1 className="display-4 fw-bold mb-3 heading-duo" style={{fontSize: "3.5rem"}}>
                          Welcome to AttendPro 👋
                        </h1>
                        <p className="lead text-muted" style={{fontSize: "1.2rem"}}>
                          A comprehensive attendance management system for
                          educational institutions
                        </p>
                      </div>
                      <div className="row g-4 mt-4">
                        <div className="col-md-4">
                          <div className="card card-duo h-100">
                            <div className="card-body text-center">
                              <div className="mb-3">
                                <span style={{ fontSize: "3rem" }}>👨‍🎓</span>
                              </div>
                              <h5 className="card-title">Student Portal</h5>
                              <p className="card-text text-muted">
                                View your attendance records and track your
                                performance
                              </p>
                              <a href="/student" className="btn btn-duo-primary">
                                Access Portal
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card card-duo h-100">
                            <div className="card-body text-center">
                              <div className="mb-3">
                                <span style={{ fontSize: "3rem" }}>👨‍🏫</span>
                              </div>
                              <h5 className="card-title">Teacher Portal</h5>
                              <p className="card-text text-muted">
                                Mark attendance and manage your classes
                              </p>
                              <a href="/teacher" className="btn btn-duo-success">
                                Access Portal
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card card-duo h-100">
                            <div className="card-body text-center">
                              <div className="mb-3">
                                <span style={{ fontSize: "3rem" }}>⚙️</span>
                              </div>
                              <h5 className="card-title">Admin Panel</h5>
                              <p className="card-text text-muted">
                                Manage students, teachers, and system settings
                              </p>
                              <a href="/admin" className="btn btn-duo-secondary">
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
          <Route path="/student" element={<StudentDashboard />} />   
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/admin" element={<AdminPanel />} /> 
        </Routes>
      </div>
    </>
  );
}

export default App;
