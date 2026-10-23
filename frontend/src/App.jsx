import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Core Dashboard Pages
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import EditPatient from './pages/EditPatient';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Prescriptions from './pages/Prescriptions';
import MedicalRecords from './pages/MedicalRecords';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

import { ROLES } from './utils/constants';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />

              {/* Patients */}
              <Route path="patients" element={<Patients />} />
              <Route
                path="patients/add"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
                    <AddPatient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patients/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
                    <EditPatient />
                  </ProtectedRoute>
                }
              />
              <Route path="patients/:id" element={<PatientDetails />} />

              {/* Appointments */}
              <Route path="appointments" element={<Appointments />} />

              {/* Doctors Directory */}
              <Route path="doctors" element={<Doctors />} />

              {/* Prescriptions */}
              <Route path="prescriptions" element={<Prescriptions />} />

              {/* Medical Records */}
              <Route path="medical-records" element={<MedicalRecords />} />

              {/* Billing & Online Payments */}
              <Route path="billing" element={<Billing />} />

              {/* Reports & Analytics */}
              <Route path="reports" element={<Reports />} />

              {/* Profile */}
              <Route path="profile" element={<Profile />} />

              {/* Helpful Route Aliases & Redirects */}
              <Route path="dashboard" element={<Navigate to="/" replace />} />
              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="patient" element={<Navigate to="/patients" replace />} />
              <Route path="patient/:id" element={<Navigate to="/patients/:id" replace />} />
              <Route path="appointment" element={<Navigate to="/appointments" replace />} />
              <Route path="doctor" element={<Navigate to="/doctors" replace />} />
              <Route path="prescription" element={<Navigate to="/prescriptions" replace />} />
              <Route path="records" element={<Navigate to="/medical-records" replace />} />
              <Route path="payments" element={<Navigate to="/billing" replace />} />

              {/* 404 Inside Layout */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
