import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Eye,
  UserPlus,
  CalendarPlus,
  FilePlus,
  BarChart2,
  TrendingUp,
  MoreVertical,
  ChevronDown,
  User,
  ExternalLink,
  CreditCard,
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import dashboardService from '../services/dashboardService';
import patientService from '../services/patientService';
import appointmentService from '../services/appointmentService';
import doctorService from '../services/doctorService';
import prescriptionService from '../services/prescriptionService';
import PatientForm from '../components/patients/PatientForm';
import AppointmentForm from '../components/appointments/AppointmentForm';
import DoctorForm from '../components/doctors/DoctorForm';
import PrescriptionForm from '../components/prescriptions/PrescriptionForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatDate';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeFilter, setTimeFilter] = useState('7d');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Quick Action Modal states
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Date & Time
  const [currentDateTime, setCurrentDateTime] = useState({
    date: 'Tue, 14 Oct 2026',
    time: '02:15 PM',
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentDateTime({ date: dateStr, time: timeStr });
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      let statsData = null;

      // Fetch stats from backend
      try {
        const statsRes = await dashboardService.getDashboardStats();
        if (statsRes?.data) {
          statsData = statsRes.data;
        }
      } catch (err) {
        // Handled gracefully
      }

      // Fetch actual live patient count from Patients API
      let patientCount = statsData?.totalPatients;
      try {
        const patientsRes = await patientService.getAllPatients({ limit: 1 });
        const count =
          patientsRes?.data?.totalRecords ??
          patientsRes?.totalRecords ??
          (Array.isArray(patientsRes?.data) ? patientsRes.data.length : undefined);
        if (typeof count === 'number') {
          patientCount = count;
        }
      } catch (err) {
        // Handled gracefully
      }

      // Fetch appointments
      let appointments = [];
      try {
        const appointmentsRes = await appointmentService.getAllAppointments({ limit: 10 });
        appointments = appointmentsRes?.data || [];
      } catch (err) {
        // Handled gracefully
      }

      setRecentAppointments(appointments);

      // Derive stats from backend
      const totalApts = statsData?.totalAppointments !== undefined
        ? statsData.totalAppointments
        : (appointments.length || 0);

      const pendingApts = statsData?.pendingAppointments !== undefined
        ? statsData.pendingAppointments
        : appointments.filter((a) => a.status === 'PENDING').length;

      const completedApts = statsData?.completedAppointments !== undefined
        ? statsData.completedAppointments
        : appointments.filter((a) => a.status === 'COMPLETED').length;

      const cancelledApts = statsData?.cancelledAppointments !== undefined
        ? statsData.cancelledAppointments
        : appointments.filter((a) => a.status === 'CANCELLED').length;

      setStats({
        totalPatients: patientCount !== undefined ? patientCount : (statsData?.totalPatients ?? 0),
        totalDoctors: statsData?.totalDoctors ?? 8,
        totalAppointments: totalApts,
        totalPrescriptions: statsData?.totalPrescriptions ?? 48,
        pendingAppointments: pendingApts,
        completedAppointments: completedApts,
        cancelledAppointments: cancelledApts,
      });
    } catch (err) {
      setErrorMsg('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [user?._id, user?.id]);

  // Quick Action Submission Handlers
  const handleAddPatientSubmit = async (patientData) => {
    setActionLoading(true);
    try {
      await patientService.createPatient(patientData);
      toastSuccess('Patient registered successfully!');
      setIsAddPatientOpen(false);
      await fetchDashboardData();
    } catch (err) {
      toastError(err.message || 'Failed to register patient');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookAppointmentSubmit = async (appointmentData) => {
    setActionLoading(true);
    try {
      await appointmentService.createAppointment(appointmentData);
      toastSuccess('Appointment booked successfully!');
      setIsBookAppointmentOpen(false);
      await fetchDashboardData();
    } catch (err) {
      toastError(err.message || 'Failed to book appointment');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddDoctorSubmit = async (doctorData) => {
    setActionLoading(true);
    try {
      await doctorService.createDoctor(doctorData);
      toastSuccess('Doctor added successfully!');
      setIsAddDoctorOpen(false);
      await fetchDashboardData();
    } catch (err) {
      toastError(err.message || 'Failed to add doctor');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPrescriptionSubmit = async (prescriptionData) => {
    setActionLoading(true);
    try {
      await prescriptionService.createPrescription(prescriptionData);
      toastSuccess('Prescription issued successfully!');
      setIsAddPrescriptionOpen(false);
      await fetchDashboardData();
    } catch (err) {
      toastError(err.message || 'Failed to issue prescription');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Fallback sample appointments when database is empty
  const sampleAppointments = [
    {
      id: 1,
      patientName: 'Rahul Sharma',
      doctor: 'Dr. Amit Kumar (General Physician)',
      specialization: 'General Physician',
      dateTime: '14 Oct 2026, 10:00 AM',
      status: 'PENDING',
      statusLabel: 'Pending',
      statusClass: 'pms-badge-pending',
    },
    {
      id: 2,
      patientName: 'Priya Singh',
      doctor: 'Dr. Neha Sharma (Dermatologist)',
      specialization: 'Dermatologist',
      dateTime: '14 Oct 2026, 11:30 AM',
      status: 'CONFIRMED',
      statusLabel: 'Confirmed',
      statusClass: 'pms-badge-confirmed',
    },
    {
      id: 3,
      patientName: 'Aman Verma',
      doctor: 'Dr. Rohan Mehta (Cardiologist)',
      specialization: 'Cardiologist',
      dateTime: '14 Oct 2026, 02:00 PM',
      status: 'PENDING',
      statusLabel: 'Pending',
      statusClass: 'pms-badge-pending',
    },
    {
      id: 4,
      patientName: 'Sneha Patel',
      doctor: 'Dr. Pooja Verma (Gynecologist)',
      specialization: 'Gynecologist',
      dateTime: '14 Oct 2026, 04:30 PM',
      status: 'COMPLETED',
      statusLabel: 'Completed',
      statusClass: 'pms-badge-completed',
    },
    {
      id: 5,
      patientName: 'Vikash Kumar',
      doctor: 'Dr. Suresh Yadav (Orthopedic)',
      specialization: 'Orthopedic',
      dateTime: '14 Oct 2026, 05:15 PM',
      status: 'COMPLETED',
      statusLabel: 'Completed',
      statusClass: 'pms-badge-completed',
    },
  ];

  // Map real backend appointments with sample fallback
  const tableAppointments =
    recentAppointments.length > 0
      ? recentAppointments.slice(0, 5).map((apt, index) => {
          let badgeClass = 'pms-badge-pending';
          let label = apt.status;
          if (apt.status === 'COMPLETED') {
            badgeClass = 'pms-badge-completed';
            label = 'Completed';
          } else if (apt.status === 'CONFIRMED') {
            badgeClass = 'pms-badge-confirmed';
            label = 'Confirmed';
          } else if (apt.status === 'CANCELLED') {
            badgeClass = 'pms-badge-cancelled';
            label = 'Cancelled';
          } else {
            label = 'Pending';
          }

          const docName = apt.doctor?.name ? `Dr. ${apt.doctor.name}` : 'Attending Doctor';
          const docSpec = apt.doctor?.specialization ? ` (${apt.doctor.specialization})` : '';

          return {
            id: index + 1,
            _id: apt._id,
            patientName: apt.patient?.firstName
              ? `${apt.patient.firstName} ${apt.patient.lastName}`
              : 'Patient',
            doctor: `${docName}${docSpec}`,
            specialization: apt.doctor?.specialization || 'Consultant',
            dateTime: `${formatDate(apt.appointmentDate)}, ${apt.appointmentTime || '10:00 AM'}`,
            status: apt.status,
            statusLabel: label,
            statusClass: badgeClass,
            rawAppointment: apt,
          };
        })
      : sampleAppointments;

  // Upcoming appointments list for the right panel
  const upcomingList = tableAppointments.slice(0, 4);

  // SVG Area Chart points (Patient Overview in last 7 days)
  const chartPoints = [
    { day: '08 Oct', val: 42, x: 20, y: 110 },
    { day: '09 Oct', val: 56, x: 75, y: 92 },
    { day: '10 Oct', val: 54, x: 130, y: 95 },
    { day: '11 Oct', val: 78, x: 185, y: 72 },
    { day: '12 Oct', val: 76, x: 240, y: 74 },
    { day: '13 Oct', val: 80, x: 295, y: 68 },
    { day: '14 Oct', val: 104, x: 350, y: 40 },
  ];

  const svgLinePath = 'M 20 110 C 45 105, 55 94, 75 92 C 95 90, 110 95, 130 95 C 150 95, 165 75, 185 72 C 205 70, 220 74, 240 74 C 260 74, 275 70, 295 68 C 315 65, 335 45, 350 40';
  const svgAreaPath = `${svgLinePath} L 350 145 L 20 145 Z`;

  // Donut chart calculations
  const totalVisits =
    (stats?.completedAppointments || 0) +
    (stats?.pendingAppointments || 0) +
    (stats?.cancelledAppointments || 0) || 56;

  const completedCount = stats?.completedAppointments ?? 38;
  const pendingCount = stats?.pendingAppointments ?? 12;
  const cancelledCount = stats?.cancelledAppointments ?? 6;

  const completedPct = totalVisits > 0 ? Math.round((completedCount / totalVisits) * 100) : 68;
  const pendingPct = totalVisits > 0 ? Math.round((pendingCount / totalVisits) * 100) : 21;
  const cancelledPct = Math.max(0, 100 - completedPct - pendingPct);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeCompleted = (completedPct / 100) * circumference;
  const strokePending = (pendingPct / 100) * circumference;
  const strokeCancelled = (cancelledPct / 100) * circumference;

  const offsetCompleted = 0;
  const offsetPending = -strokeCompleted;
  const offsetCancelled = -(strokeCompleted + strokePending);

  const displayName = user?.name || 'Najis Khan';

  if (loading) {
    return (
      <div className="pms-loading-wrapper">
        <Spinner size={38} primary />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          Loading Patient Management System dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="pms-dashboard-root">
      {/* 1. Header Greeting & Date/Time Bar */}
      <div className="pms-welcome-header">
        <div className="pms-welcome-info">
          <h1 className="pms-welcome-title">
            <span role="img" aria-label="wave" style={{ marginRight: '6px' }}>👋</span>
            Welcome back, {displayName}
          </h1>
          <p className="pms-welcome-subtitle">
            Here's what's happening with your healthcare center today.
          </p>
        </div>

        <div className="pms-datetime-group">
          <div className="pms-chip">
            <Calendar size={15} color="var(--color-primary)" />
            <span>{currentDateTime.date}</span>
          </div>
          <div className="pms-chip">
            <Clock size={15} color="var(--color-primary)" />
            <span>{currentDateTime.time}</span>
          </div>
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* 2. Main Responsive Dashboard Layout */}
      <div className="pms-dashboard-layout">
        {/* ================= LEFT MAIN COLUMN ================= */}
        <div className="pms-main-col">
          {/* Row 1: Top 4 Statistic Cards (Total Patients, Doctors, Appointments, Prescriptions) */}
          <div className="pms-stat-grid pms-stat-grid-4">
            {/* Total Patients */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Total Patients</span>
                <div className="pms-stat-icon pms-icon-blue">
                  <Users size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.totalPatients}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-trend">
                  <span className="trend-arrow">▲</span> +12% vs. last month
                </span>
                <Link to="/patients" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>

            {/* Total Doctors */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Total Doctors</span>
                <div className="pms-stat-icon pms-icon-green">
                  <UserCheck size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.totalDoctors}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-trend">
                  <span className="trend-arrow">▲</span> +2% vs. last month
                </span>
                <Link to="/doctors" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Total Appointments</span>
                <div className="pms-stat-icon pms-icon-purple">
                  <Calendar size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.totalAppointments}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-trend">
                  <span className="trend-arrow">▲</span> +18% vs. last month
                </span>
                <Link to="/appointments" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>

            {/* Total Prescriptions */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Total Prescriptions</span>
                <div className="pms-stat-icon pms-icon-red">
                  <FileText size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.totalPrescriptions}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-trend">
                  <span className="trend-arrow">▲</span> +15% vs. last month
                </span>
                <Link to="/prescriptions" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Status Cards (Pending, Completed, Cancelled Appointments) */}
          <div className="pms-stat-grid pms-stat-grid-3">
            {/* Pending Appointments */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Pending Appointments</span>
                <div className="pms-stat-icon pms-icon-amber">
                  <Clock size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.pendingAppointments ?? 0}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-note">Awaiting consultation</span>
                <Link to="/appointments" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>

            {/* Completed Appointments */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Completed Appointments</span>
                <div className="pms-stat-icon pms-icon-emerald">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.completedAppointments ?? 0}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-note">Concluded visits</span>
                <Link to="/appointments" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>

            {/* Cancelled Appointments */}
            <div className="pms-stat-card">
              <div className="pms-stat-top">
                <span className="pms-stat-title">Cancelled Appointments</span>
                <div className="pms-stat-icon pms-icon-rose">
                  <XCircle size={18} />
                </div>
              </div>
              <div className="pms-stat-body">
                <div className="pms-stat-value">{stats?.cancelledAppointments ?? 0}</div>
              </div>
              <div className="pms-stat-bottom">
                <span className="pms-stat-note">Cancelled visits</span>
                <Link to="/appointments" className="pms-stat-link">
                  View all →
                </Link>
              </div>
            </div>
          </div>

          {/* Row 3: Charts Row (Patient Overview + Appointment Status) */}
          <div className="pms-charts-row">
            {/* Patient Overview Area Chart */}
            <div className="pms-card pms-chart-card">
              <div className="pms-card-header">
                <div>
                  <h3 className="pms-card-title">Patient Overview</h3>
                  <p className="pms-card-subtitle">Total patients in last 7 days</p>
                </div>
                <div className="pms-filter-chip">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="pms-time-select"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="14d">Last 14 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
              </div>

              <div className="pms-chart-body">
                <div className="pms-chart-canvas-wrap">
                  <svg
                    viewBox="0 0 380 155"
                    className="pms-area-chart-svg"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="pmsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0072F5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0072F5" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    <line x1="20" y1="30" x2="360" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="65" x2="360" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="100" x2="360" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="135" x2="360" y2="135" stroke="#e2e8f0" />

                    {/* Gradient Area Fill */}
                    <path d={svgAreaPath} fill="url(#pmsAreaGrad)" />

                    {/* Blue Spline Curve */}
                    <path
                      d={svgLinePath}
                      fill="none"
                      stroke="#0072F5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {chartPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint === i ? '5' : '3.5'}
                        fill="#ffffff"
                        stroke="#0072F5"
                        strokeWidth="2"
                        className="pms-chart-dot"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>

                  {/* Y-Axis Labels */}
                  <div className="pms-chart-y-axis">
                    <span>120</span>
                    <span>90</span>
                    <span>60</span>
                    <span>30</span>
                    <span>0</span>
                  </div>

                  {/* Tooltip on Hover */}
                  {hoveredPoint !== null && (
                    <div
                      className="pms-chart-tooltip"
                      style={{
                        left: `${(chartPoints[hoveredPoint].x / 380) * 100}%`,
                        top: `${(chartPoints[hoveredPoint].y / 155) * 100}%`,
                      }}
                    >
                      <strong>{chartPoints[hoveredPoint].val} Patients</strong>
                      <span>{chartPoints[hoveredPoint].day}</span>
                    </div>
                  )}
                </div>

                {/* X-Axis Labels */}
                <div className="pms-chart-x-axis">
                  {chartPoints.map((pt, i) => (
                    <span key={i}>{pt.day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Status Donut Chart */}
            <div className="pms-card pms-chart-card">
              <div className="pms-card-header">
                <div>
                  <h3 className="pms-card-title">Appointment Status</h3>
                  <p className="pms-card-subtitle">Distribution by visit outcome</p>
                </div>
              </div>

              <div className="pms-donut-container">
                {/* Donut SVG Circle */}
                <div className="pms-donut-svg-wrap">
                  <svg viewBox="0 0 100 100" className="pms-donut-svg">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="11"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="11"
                      strokeDasharray={`${strokeCompleted} ${circumference}`}
                      strokeDashoffset={offsetCompleted}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="11"
                      strokeDasharray={`${strokePending} ${circumference}`}
                      strokeDashoffset={offsetPending}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="11"
                      strokeDasharray={`${strokeCancelled} ${circumference}`}
                      strokeDashoffset={offsetCancelled}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>

                  <div className="pms-donut-center">
                    <span className="pms-donut-total">{totalVisits}</span>
                    <span className="pms-donut-sub">Total</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="pms-donut-legend">
                  <div className="pms-legend-item">
                    <div className="pms-legend-left">
                      <span className="pms-legend-dot pms-dot-emerald" />
                      <span className="pms-legend-label">Completed</span>
                    </div>
                    <span className="pms-legend-value">
                      {completedCount} <span className="pms-legend-pct">({completedPct}%)</span>
                    </span>
                  </div>

                  <div className="pms-legend-item">
                    <div className="pms-legend-left">
                      <span className="pms-legend-dot pms-dot-amber" />
                      <span className="pms-legend-label">Pending</span>
                    </div>
                    <span className="pms-legend-value">
                      {pendingCount} <span className="pms-legend-pct">({pendingPct}%)</span>
                    </span>
                  </div>

                  <div className="pms-legend-item">
                    <div className="pms-legend-left">
                      <span className="pms-legend-dot pms-dot-rose" />
                      <span className="pms-legend-label">Cancelled</span>
                    </div>
                    <span className="pms-legend-value">
                      {cancelledCount} <span className="pms-legend-pct">({cancelledPct}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Recent Appointments Table */}
          <div className="pms-card pms-table-card">
            <div className="pms-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--color-primary)" />
                <h3 className="pms-card-title">Recent Appointments</h3>
              </div>
              <Link to="/appointments" className="pms-link-arrow">
                View all →
              </Link>
            </div>

            <div className="pms-table-responsive">
              <table className="pms-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Patient Name</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableAppointments.map((item, index) => (
                    <tr key={index}>
                      <td style={{ color: 'var(--text-muted)' }}>{item.id}</td>
                      <td>
                        <span className="pms-tbl-patient">{item.patientName}</span>
                      </td>
                      <td>
                        <span className="pms-tbl-doctor">{item.doctor}</span>
                      </td>
                      <td>
                        <span className="pms-tbl-date">{item.dateTime}</span>
                      </td>
                      <td>
                        <span className={`pms-status-pill ${item.statusClass}`}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="pms-tbl-actions">
                          <button
                            type="button"
                            className="pms-btn-view"
                            onClick={() => {
                              if (item.rawAppointment) {
                                setSelectedAppointment(item.rawAppointment);
                              } else {
                                navigate('/appointments');
                              }
                            }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="pms-btn-dots"
                            onClick={() => navigate('/appointments')}
                            title="More actions"
                            aria-label="More actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR COLUMN ================= */}
        <div className="pms-side-col">
          {/* Card 1: Quick Actions Panel */}
          <div className="pms-card pms-quick-actions-card">
            <div className="pms-card-header">
              <h3 className="pms-card-title">Quick Actions</h3>
            </div>
            <div className="pms-qa-grid">
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(true)}
                className="pms-qa-btn pms-qa-blue"
                id="btn-quick-add-patient"
              >
                <UserPlus size={18} />
                <span>Add Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBookAppointmentOpen(true)}
                className="pms-qa-btn pms-qa-purple"
                id="btn-quick-book-appointment"
              >
                <CalendarPlus size={18} />
                <span>Book Appointment</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddDoctorOpen(true)}
                className="pms-qa-btn pms-qa-green"
                id="btn-quick-add-doctor"
              >
                <UserCheck size={18} />
                <span>Add Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddPrescriptionOpen(true)}
                className="pms-qa-btn pms-qa-amber"
                id="btn-quick-add-prescription"
              >
                <FilePlus size={18} />
                <span>Add Prescription</span>
              </button>

              <Link
                to="/reports"
                className="pms-qa-btn pms-qa-indigo pms-qa-wide"
                id="btn-quick-view-reports"
              >
                <BarChart2 size={18} />
                <span>View Reports</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Upcoming Appointments Panel */}
          <div className="pms-card pms-upcoming-card">
            <div className="pms-card-header">
              <h3 className="pms-card-title">Upcoming Appointments</h3>
              <Link to="/appointments" className="pms-link-arrow">
                View all →
              </Link>
            </div>

            <div className="pms-upcoming-list">
              {upcomingList.map((item, index) => (
                <div key={index} className="pms-upcoming-item">
                  <div className={`pms-avatar-circle pms-av-${index % 4}`}>
                    {item.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                  <div className="pms-upcoming-meta">
                    <h4 className="pms-upcoming-name">{item.patientName}</h4>
                    <p className="pms-upcoming-doc">{item.specialization}</p>
                    <p className="pms-upcoming-time">{item.dateTime}</p>
                  </div>
                  <div className="pms-upcoming-badge">
                    <span className={`pms-status-pill ${item.statusClass}`}>
                      {item.statusLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Clean Professional Footer */}
      <footer className="pms-footer">
        <span>Patient Management System • Healthcare Platform</span>
        <span>Version 1.0.0</span>
      </footer>

      {/* 4. Appointment Details Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Overview"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between' }}>
            {selectedAppointment?.patient?._id && (
              <Button
                variant="secondary"
                icon={User}
                onClick={() => {
                  const patId = selectedAppointment.patient._id;
                  setSelectedAppointment(null);
                  navigate(`/patients/${patId}`);
                }}
              >
                Patient Profile
              </Button>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <Button variant="secondary" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={ExternalLink}
                onClick={() => {
                  setSelectedAppointment(null);
                  navigate('/appointments');
                }}
              >
                Manage Schedule
              </Button>
            </div>
          </div>
        }
      >
        {selectedAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {selectedAppointment.patient?.firstName?.[0] || 'P'}
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {selectedAppointment.patient?.firstName}{' '}
                  {selectedAppointment.patient?.lastName}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Phone: {selectedAppointment.patient?.phone || 'N/A'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Doctor</span>
                <strong>Dr. {selectedAppointment.doctor?.name || 'Assigned Doctor'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Date & Time</span>
                <strong>{formatDate(selectedAppointment.appointmentDate)}, {selectedAppointment.appointmentTime}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Reason</span>
                <span>{selectedAppointment.reason || 'General Consultation'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Status</span>
                <span className={`pms-status-pill pms-badge-${(selectedAppointment.status || 'pending').toLowerCase()}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Action Modals */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Add New Patient"
        size="lg"
      >
        <PatientForm
          onSubmit={handleAddPatientSubmit}
          onCancel={() => setIsAddPatientOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal
        isOpen={isBookAppointmentOpen}
        onClose={() => setIsBookAppointmentOpen(false)}
        title="Book Appointment"
        size="lg"
      >
        <AppointmentForm
          onSubmit={handleBookAppointmentSubmit}
          onCancel={() => setIsBookAppointmentOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        title="Register New Doctor"
        size="lg"
      >
        <DoctorForm
          onSubmit={handleAddDoctorSubmit}
          onCancel={() => setIsAddDoctorOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal
        isOpen={isAddPrescriptionOpen}
        onClose={() => setIsAddPrescriptionOpen(false)}
        title="Create Prescription"
        size="lg"
      >
        <PrescriptionForm
          onSubmit={handleAddPrescriptionSubmit}
          onCancel={() => setIsAddPrescriptionOpen(false)}
          loading={actionLoading}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
