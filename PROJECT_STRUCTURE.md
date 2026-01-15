# 📁 AttendPro Project Structure Guide

This document explains what each file and folder does, so you know where to edit when you need to make changes.

---

## 🎯 **Quick Navigation Guide**

### **Frontend (React) Files** → `attendpro-frontend/`
### **Backend (FastAPI) Files** → `backend/`
### **Database Migrations** → `backend/alembic/versions/`

---

## 📂 **FRONTEND STRUCTURE** (`attendpro-frontend/`)

### **Root Configuration Files**

#### `package.json`
- **What it is**: Lists all npm dependencies and scripts
- **Edit when**: Adding/removing npm packages, changing build scripts
- **Example**: `npm install axios` updates this file

#### `vite.config.js`
- **What it is**: Vite build tool configuration
- **Edit when**: Changing build settings, port numbers, or proxy settings
- **Usually**: Don't need to edit this

#### `index.html`
- **What it is**: Main HTML template
- **Edit when**: Changing page title, adding meta tags, or modifying the root element
- **Usually**: Don't need to edit this

---

### **Source Files** (`src/`)

#### **Entry Point**
- **`main.jsx`**
  - **What it is**: Application entry point - starts React app
  - **Edit when**: Adding global CSS imports, changing router setup
  - **Contains**: Bootstrap CSS, Duolingo theme CSS imports

#### **Main App Component**
- **`App.jsx`**
  - **What it is**: Main app component with routing
  - **Edit when**: Adding new routes, changing home page layout
  - **Contains**: Routes for `/`, `/login`, `/student`, `/teacher`, `/admin`

---

### **Pages** (`src/pages/`)

#### **`Login.jsx`**
- **What it is**: Login page for students and teachers
- **Edit when**: Changing login UI, adding authentication logic
- **Features**: Email-based login, redirects to dashboards

#### **`StudentDashboard.jsx`**
- **What it is**: Student portal - view attendance, messages, history
- **Edit when**: 
  - Changing student UI/layout
  - Adding new student features
  - Modifying attendance display
- **Features**: Home tab, Absent History, Attendance by Subject, Messages

#### **`TeacherDashboard.jsx`**
- **What it is**: Teacher portal - mark and view attendance
- **Edit when**:
  - Changing teacher UI/layout
  - Modifying attendance marking flow
  - Adding teacher features
- **Features**: Mark Attendance, View Attendance, Start New Lecture

#### **`AdminPanel.jsx`**
- **What it is**: Admin/HOD portal - manage everything
- **Edit when**:
  - Changing admin UI/layout
  - Adding admin features
  - Modifying setup workflows
- **Features**: Setup Phase, Assigned Teachers, View Attendance, Low Attendance Alerts, Semester End

---

### **Components** (`src/components/`)

#### **`Navbar.jsx`**
- **What it is**: Navigation bar component
- **Edit when**: Changing navigation menu, adding links, modifying header

---

### **Services** (`src/services/`)

These files handle API calls to the backend:

#### **`api.js`**
- **What it is**: Base API configuration (if exists)
- **Edit when**: Changing API base URL globally

#### **`studentService.js`**
- **What it is**: API calls for student operations
- **Edit when**: Adding new student-related API endpoints
- **Functions**: `getStudents()`, `createStudent()`, `deleteStudent()`, `getClasses()`

#### **`teacherService.js`**
- **What it is**: API calls for teacher operations
- **Edit when**: Adding new teacher-related API endpoints
- **Functions**: `getTeachers()`, `createTeacher()`, `loginTeacher()`, `getSubjectsByTeacher()`

#### **`subjectService.js`**
- **What it is**: API calls for subject operations
- **Edit when**: Adding new subject-related API endpoints
- **Functions**: `getSubjects()`, `createSubject()`, `updateSubject()`, `deleteSubject()`

#### **`attendanceService.js`**
- **What it is**: API calls for attendance operations
- **Edit when**: Adding new attendance-related API endpoints
- **Functions**: `getAttendance()`, `createAttendance()`, `createBulkAttendance()`

#### **`messageService.js`**
- **What it is**: API calls for message operations
- **Edit when**: Adding new message-related API endpoints
- **Functions**: `getMessages()`, `createMessage()`, `createBulkMessages()`, `markMessageAsRead()`

#### **`semesterService.js`**
- **What it is**: API calls for semester operations
- **Edit when**: Adding new semester-related API endpoints
- **Functions**: `endSemester()`, `getSemesterHistory()`, `verifyPassword()`

---

### **Configuration** (`src/config/`)

#### **`api.js`**
- **What it is**: Centralized API base URL configuration
- **Edit when**: Changing backend URL (e.g., from localhost to production)
- **Contains**: `API_URL` constant

---

### **Constants** (`src/constants/`)

#### **`classes.js`**
- **What it is**: List of predefined classes (FYCO1, FYCO2, etc.)
- **Edit when**: Adding/removing class names
- **Contains**: Array of class names exported as `CLASSES`

---

### **Styles** (`src/styles/`)

#### **`duolingo-theme.css`**
- **What it is**: Custom Duolingo-inspired color theme and styles
- **Edit when**: 
  - Changing colors globally
  - Modifying button styles
  - Changing card/badge/tab styles
  - Updating overall theme
- **Contains**: CSS variables, button classes, card classes, badge classes, etc.

#### **`index.css`**
- **What it is**: Global CSS styles
- **Edit when**: Adding global styles, reset styles, or utility classes

---

## 📂 **BACKEND STRUCTURE** (`backend/`)

### **Main Application** (`app/`)

#### **`main.py`**
- **What it is**: FastAPI application entry point
- **Edit when**: 
  - Adding new routers
  - Changing CORS settings
  - Adding middleware
  - Modifying app configuration
- **Contains**: FastAPI app instance, CORS middleware, router registration

---

### **API Routers** (`app/api/routers/`)

These files define the API endpoints:

#### **`students.py`**
- **What it is**: Student-related API endpoints
- **Edit when**: Adding/modifying student endpoints
- **Endpoints**: `GET /students/`, `POST /students/`, `GET /students/{id}`, `DELETE /students/{id}`, `GET /students/classes/list`

#### **`teachers.py`**
- **What it is**: Teacher-related API endpoints
- **Edit when**: Adding/modifying teacher endpoints
- **Endpoints**: `GET /teachers/`, `POST /teachers/`, `PATCH /teachers/{id}`, `DELETE /teachers/{id}`

#### **`subjects.py`**
- **What it is**: Subject-related API endpoints
- **Edit when**: Adding/modifying subject endpoints
- **Endpoints**: `GET /subjects/`, `POST /subjects/`, `PATCH /subjects/{id}`, `DELETE /subjects/{id}`

#### **`attendance.py`**
- **What it is**: Attendance-related API endpoints
- **Edit when**: Adding/modifying attendance endpoints
- **Endpoints**: `GET /attendance/`, `POST /attendance/`, `POST /attendance/bulk`, `PATCH /attendance/{id}`

#### **`messages.py`**
- **What it is**: Message-related API endpoints
- **Edit when**: Adding/modifying message endpoints
- **Endpoints**: `GET /messages/`, `POST /messages/`, `POST /messages/bulk`, `PATCH /messages/{id}`

#### **`semester.py`**
- **What it is**: Semester-related API endpoints
- **Edit when**: Adding/modifying semester endpoints
- **Endpoints**: `POST /semester/end`, `GET /semester/history`, `POST /semester/verify-password`

---

### **Schemas** (`app/schemas/`)

These files define data validation models (Pydantic):

#### **`student.py`**
- **What it is**: Student data models (StudentCreate, StudentUpdate, StudentOut)
- **Edit when**: Adding/removing student fields
- **Contains**: Pydantic models for student data validation

#### **`teacher.py`**
- **What it is**: Teacher data models
- **Edit when**: Adding/removing teacher fields

#### **`subject.py`**
- **What it is**: Subject data models
- **Edit when**: Adding/removing subject fields

#### **`attendance.py`**
- **What it is**: Attendance data models
- **Edit when**: Adding/removing attendance fields

#### **`message.py`**
- **What it is**: Message data models
- **Edit when**: Adding/removing message fields

#### **`semester.py`**
- **What it is**: Semester archive data models
- **Edit when**: Adding/removing semester archive fields

#### **`admin.py`**
- **What it is**: Admin data models
- **Edit when**: Adding/removing admin fields

---

### **Database Models** (`models/`)

These files define database tables (SQLAlchemy):

#### **`student.py`**
- **What it is**: Student database table definition
- **Edit when**: Adding/removing student columns
- **Fields**: `id`, `roll_no`, `name`, `email`, `class_name`, `created_at`

#### **`teacher.py`**
- **What it is**: Teacher database table definition
- **Edit when**: Adding/removing teacher columns
- **Fields**: `id`, `name`, `email`, `department`, `created_at`

#### **`subject.py`**
- **What it is**: Subject database table definition
- **Edit when**: Adding/removing subject columns
- **Fields**: `id`, `name`, `code`, `teacher_id`, `class_name`, `created_at`

#### **`attendance.py`**
- **What it is**: Attendance database table definition
- **Edit when**: Adding/removing attendance columns
- **Fields**: `id`, `student_id`, `subject_id`, `date`, `time`, `lecture_type`, `status`, `remarks`, `created_at`

#### **`message.py`**
- **What it is**: Message database table definition
- **Edit when**: Adding/removing message columns
- **Fields**: `id`, `student_id`, `sender_type`, `message`, `is_read`, `created_at`

#### **`semester_archive.py`**
- **What it is**: Semester archive database table definition
- **Edit when**: Adding/removing archive columns
- **Fields**: `id`, `semester_name`, `archived_at`, `total_students`, `total_subjects`, etc.

#### **`admin.py`**
- **What it is**: Admin database table definition
- **Edit when**: Adding/removing admin columns
- **Fields**: `id`, `email`, `name`, `password`, `created_at`

---

### **Database Configuration** (`db/`)

#### **`session.py`**
- **What it is**: Database session management
- **Edit when**: Changing database connection settings
- **Contains**: `get_db()` function for database sessions

---

### **Core Configuration** (`app/core/`)

#### **`config.py`**
- **What it is**: Application configuration (database URL, etc.)
- **Edit when**: Changing database settings, environment variables
- **Contains**: Database connection string, settings

---

### **Database Migrations** (`alembic/versions/`)

These files create/modify database tables:

#### **Migration Files** (e.g., `fb109858aa1e_create_students_table.py`)
- **What it is**: Database schema changes
- **Edit when**: Creating new migrations (usually auto-generated)
- **How to create**: Run `alembic revision --autogenerate -m "description"`
- **How to apply**: Run `alembic upgrade head`

**Important Migration Files:**
- `fb109858aa1e_create_students_table.py` - Creates students table
- `06bdd14caf07_add_teachers_and_subjects.py` - Creates teachers and subjects tables
- `efd0cf22aebc_add_attendance_table.py` - Creates attendance table
- `5cdfc527d9ea_add_subject_class_name_and_messages_.py` - Adds class_name and messages
- `7d89c6260146_add_semester_archive_table.py` - Creates semester archive table
- `f1112a7b72f9_add_admin_table.py` - Creates admin table

#### **`alembic/env.py`**
- **What it is**: Alembic configuration for migrations
- **Edit when**: Changing database connection for migrations
- **Usually**: Don't need to edit

#### **`alembic.ini`**
- **What it is**: Alembic configuration file
- **Edit when**: Changing migration settings
- **Usually**: Don't need to edit

---

### **Scripts** (`scripts/`)

#### **`populate_students.py`**
- **What it is**: Script to populate database with test students
- **Edit when**: Changing test data generation
- **Run with**: `python scripts/populate_students.py`

#### **`populate_students.sh`**
- **What it is**: Shell script wrapper for populate_students.py
- **Edit when**: Changing script execution method

---

## 🎨 **Common Edit Scenarios**

### **Want to change colors/theme?**
→ Edit `attendpro-frontend/src/styles/duolingo-theme.css`

### **Want to add a new API endpoint?**
→ Edit the corresponding router in `backend/app/api/routers/[name].py`
→ Add the service function in `attendpro-frontend/src/services/[name]Service.js`

### **Want to add a new database field?**
1. Edit the model in `backend/models/[name].py`
2. Edit the schema in `backend/app/schemas/[name].py`
3. Create a migration: `alembic revision --autogenerate -m "add field"`
4. Apply migration: `alembic upgrade head`
5. Update frontend service if needed

### **Want to change the UI of a dashboard?**
→ Edit the corresponding page in `attendpro-frontend/src/pages/[Dashboard].jsx`

### **Want to add a new page/route?**
1. Create page in `attendpro-frontend/src/pages/[PageName].jsx`
2. Add route in `attendpro-frontend/src/App.jsx`
3. Add service functions if needed in `attendpro-frontend/src/services/`

### **Want to change backend URL?**
→ Edit `attendpro-frontend/src/config/api.js`

### **Want to add a new class?**
→ Edit `attendpro-frontend/src/constants/classes.js`

### **Want to modify database structure?**
1. Edit model in `backend/models/[name].py`
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Review migration file in `backend/alembic/versions/`
4. Apply: `alembic upgrade head`

---

## 📝 **File Size Reference**

- **Large Files** (1000+ lines): `AdminPanel.jsx`, `TeacherDashboard.jsx`
- **Medium Files** (200-1000 lines): `StudentDashboard.jsx`, router files
- **Small Files** (<200 lines): Service files, schemas, models

---

## 🔍 **Quick Find Guide**

| What you want to change | File to edit |
|------------------------|--------------|
| Student UI | `attendpro-frontend/src/pages/StudentDashboard.jsx` |
| Teacher UI | `attendpro-frontend/src/pages/TeacherDashboard.jsx` |
| Admin UI | `attendpro-frontend/src/pages/AdminPanel.jsx` |
| Colors/Theme | `attendpro-frontend/src/styles/duolingo-theme.css` |
| Student API | `backend/app/api/routers/students.py` |
| Teacher API | `backend/app/api/routers/teachers.py` |
| Attendance API | `backend/app/api/routers/attendance.py` |
| Student Database | `backend/models/student.py` |
| Database Migrations | `backend/alembic/versions/` |
| API Base URL | `attendpro-frontend/src/config/api.js` |
| Class Names | `attendpro-frontend/src/constants/classes.js` |

---

## 💡 **Tips**

1. **Always test after editing**: Run frontend (`npm run dev`) and backend (`uvicorn app.main:app --reload`)
2. **Database changes**: Always create migrations, don't edit tables directly
3. **API changes**: Update both backend router AND frontend service
4. **UI changes**: Check all three dashboards if it's a global change
5. **Backup**: Commit changes to git before major edits

---

**Last Updated**: After Duolingo theme implementation

