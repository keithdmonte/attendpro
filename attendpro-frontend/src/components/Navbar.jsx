import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="me-2">📚</span>
          AttendPro
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
                to="/login"
              >
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/student") ? "active" : ""}`}
                to="/student"
              >
                Student Portal
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/teacher") ? "active" : ""}`}
                to="/teacher"
              >
                Teacher Portal
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                to="/admin"
              >
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
