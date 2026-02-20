import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, userType }) => {
  // Check if user is logged in based on userType
  const isAuthenticated = () => {
    const storedUserType = localStorage.getItem("userType");
    
    if (userType === "student") {
      return storedUserType === "student" && localStorage.getItem("studentId");
    } else if (userType === "teacher") {
      return storedUserType === "teacher" && localStorage.getItem("teacherId");
    } else if (userType === "admin") {
      // Admin panel - allow access for now (can add admin login later)
      // If admin login is added, check: storedUserType === "admin" && localStorage.getItem("adminId")
      return true;
    }
    return false;
  };

  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
