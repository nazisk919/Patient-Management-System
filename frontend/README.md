# CarePulse — Patient Management System (React Frontend)

A modern, production-grade React frontend built with Vite, React Router DOM, Axios, and a custom healthcare design system. This frontend is designed to integrate with the Node.js / Express / MongoDB backend.

---

## 🌟 Key Features

* **Executive Healthcare Dashboard**: Real statistics breakdown (Total Patients, Total Doctors, Total Appointments, Total Prescriptions, Pending/Completed/Cancelled appointments) derived directly from backend APIs, with recent patient and appointment widgets.
* **Patient Management (EHR)**:
  * Full patient directory table with live search and blood group filtering.
  * Register new patient with validation conforming to the backend schema (demographics, emergency contacts, physical vitals).
  * Edit patient details.
  * Rich Patient Profile page with BMI calculator and history tabs.
  * Safe patient deletion with modal confirmation for administrators.
* **Appointment Scheduling**:
  * Filter consultations by status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
  * One-click appointment booking with attending doctor selection and patient linking.
  * Status transition workflow (Confirm, Complete, Cancel).
* **Doctor Directory**:
  * Medical practitioner directory with specializations, qualifications, fees, and consultation schedules.
  * Doctor registration and profile management.
* **Prescriptions & EHR**:
  * Multi-medicine prescription issuance with dosage, frequency, and duration.
  * Electronic medical records with diagnosis, symptoms, allergies, and treatment plans.
* **Authentication & Authorization**:
  * JWT Bearer token authentication with centralized Axios interceptors.
  * Role-based access control supporting `ADMIN`, `STAFF`, `DOCTOR`, and `PATIENT`.
  * Login, Register, Forgot Password, and Reset Password flows.
  * Quick Demo Preview access for instant UI evaluation.
* **UI/UX Design Excellence**:
  * Responsive sidebar navigation and sticky glassmorphic top navbar.
  * Clean medical color palette (Slate, Sky Blue, Electric Teal, Emerald).
  * Micro-animations, skeleton shimmers, floating toast notifications, accessible modals, and empty state fallbacks.

---

## 📁 Directory Structure

```
frontend/
├── .env                  # Frontend environment variables
├── .env.example          # Environment variables template
├── index.html            # Main HTML with Plus Jakarta Sans typography
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration (runs on port 3000)
└── src/
    ├── assets/           # Static assets and icons
    ├── components/
    │   ├── common/       # Alert, Badge, Button, Modal, Spinner, StatCard, EmptyState, ProtectedRoute
    │   ├── layout/       # Sidebar, Navbar, Layout
    │   ├── patients/     # PatientTable, PatientForm
    │   ├── appointments/ # AppointmentTable, AppointmentForm
    │   └── doctors/      # DoctorForm
    ├── context/
    │   ├── AuthContext.jsx   # User state, token storage, role authorization
    │   └── ToastContext.jsx  # Global toast notification provider
    ├── pages/
    │   ├── Login.jsx         # Sign in with credentials or demo preview
    │   ├── Register.jsx      # New account registration
    │   ├── ForgotPassword.jsx# Password recovery request
    │   ├── ResetPassword.jsx # Set new password via token
    │   ├── Dashboard.jsx     # KPI stats and recent activity
    │   ├── Patients.jsx      # Patient list with search & filter
    │   ├── AddPatient.jsx    # Patient registration form
    │   ├── EditPatient.jsx   # Edit existing patient
    │   ├── PatientDetails.jsx# Full patient profile, vitals, and history
    │   ├── Appointments.jsx  # Appointment schedule and status tracking
    │   ├── Doctors.jsx       # Doctor directory
    │   ├── Prescriptions.jsx # Prescriptions list and issuance
    │   ├── MedicalRecords.jsx# Health records (diagnosis, symptoms)
    │   ├── Profile.jsx       # User profile details
    │   └── NotFound.jsx      # 404 handler
    ├── services/
    │   ├── api.js            # Central Axios instance with Bearer token interceptor
    │   ├── authService.js    # Auth endpoints (/api/auth)
    │   ├── patientService.js # Patient endpoints (/api/patients)
    │   ├── appointmentService.js # Appointment endpoints (/api/appointments)
    │   ├── doctorService.js  # Doctor endpoints (/api/doctors)
    │   ├── dashboardService.js # Stats endpoints (/api/dashboard/stats)
    │   ├── prescriptionService.js # Prescription endpoints (/api/prescriptions)
    │   └── medicalRecordService.js# EHR endpoints (/api/medical-records)
    ├── utils/
    │   ├── constants.js      # Roles, blood groups, appointment statuses
    │   └── formatDate.js     # Date and age helpers
    ├── App.jsx               # Routes and providers
    ├── index.css             # Healthcare design system & utility styles
    └── main.jsx              # React root entrypoint
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js v18 or higher (v24 recommended)
* Running backend server on `http://localhost:5000`

### 2. Environment Configuration
Ensure `.env` exists in the `frontend` directory:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Installation
Navigate to the `frontend` folder and install dependencies:
```bash
cd frontend
npm install
```

### 4. Running the Development Server
Start the frontend dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
Build optimized production assets:
```bash
npm run build
```

---

## 🔗 Backend API Integration Map

| Module | HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Register new user | No |
| | POST | `/api/auth/login` | Login user & receive JWT | No |
| | GET | `/api/auth/profile` | Get current user profile | Yes (Bearer) |
| | POST | `/api/auth/forgot-password` | Send password reset link | No |
| | POST | `/api/auth/reset-password/:token` | Reset password using token | No |
| **Dashboard** | GET | `/api/dashboard/stats` | KPI statistics overview | Yes (ADMIN, STAFF) |
| **Patients** | GET | `/api/patients` | Paginated patient list with query params | Yes |
| | GET | `/api/patients/:id` | Single patient details | Yes |
| | POST | `/api/patients` | Create new patient | Yes (ADMIN, STAFF) |
| | PUT | `/api/patients/:id` | Update patient record | Yes (ADMIN, STAFF) |
| | DELETE | `/api/patients/:id` | Delete patient | Yes (ADMIN) |
| **Appointments** | GET | `/api/appointments` | Consultation appointments list | Yes |
| | GET | `/api/appointments/:id`| Appointment details | Yes |
| | POST | `/api/appointments` | Schedule consultation | Yes (ADMIN, STAFF) |
| | PUT | `/api/appointments/:id`| Update appointment status | Yes (ADMIN, STAFF) |
| | DELETE | `/api/appointments/:id`| Delete appointment | Yes (ADMIN) |
| **Doctors** | GET | `/api/doctors` | Doctor directory | Yes |
| | GET | `/api/doctors/:id` | Single doctor profile | Yes |
| | POST | `/api/doctors` | Add new doctor | Yes (ADMIN) |
| | PUT | `/api/doctors/:id` | Update doctor | Yes (ADMIN) |
| | DELETE | `/api/doctors/:id` | Remove doctor | Yes (ADMIN) |
| **Prescriptions**| GET | `/api/prescriptions` | All issued prescriptions | Yes |
| | POST | `/api/prescriptions` | Create prescription | Yes (DOCTOR, ADMIN) |
| | DELETE | `/api/prescriptions/:id`| Delete prescription | Yes (ADMIN) |
| **Medical Records**| GET | `/api/medical-records` | Electronic health records | Yes |
| | POST | `/api/medical-records`| Log medical record | Yes (DOCTOR, ADMIN) |
| | DELETE | `/api/medical-records/:id`| Delete health record | Yes (ADMIN) |
