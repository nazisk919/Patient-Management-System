import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Filter,
  UserCheck,
  CreditCard,
  Printer,
  Activity,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import patientService from '../services/patientService';
import doctorService from '../services/doctorService';
import appointmentService from '../services/appointmentService';
import prescriptionService from '../services/prescriptionService';
import billingService from '../services/billingService';

export const Reports = () => {
  const [reportRange, setReportRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalPrescriptions: 0,
    totalRevenue: 0,
    specializationBreakdown: [],
    bloodGroupBreakdown: {},
    recentConsultations: [],
  });

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [patientsRes, doctorsRes, appointmentsRes, prescriptionsRes, billingRes] =
          await Promise.allSettled([
            patientService.getAllPatients({ limit: 100 }),
            doctorService.getAllDoctors({ limit: 100 }),
            appointmentService.getAllAppointments({ limit: 100 }),
            prescriptionService.getAllPrescriptions(),
            billingService.getAllBills({ limit: 100 }),
          ]);

        const patients =
          patientsRes.status === 'fulfilled'
            ? patientsRes.value?.data?.data || patientsRes.value?.data || []
            : [];
        const totalPatients =
          patientsRes.status === 'fulfilled'
            ? patientsRes.value?.data?.totalRecords ?? patients.length
            : 0;

        const doctors =
          doctorsRes.status === 'fulfilled' ? doctorsRes.value?.data || [] : [];

        const appointments =
          appointmentsRes.status === 'fulfilled'
            ? appointmentsRes.value?.data || []
            : [];

        const prescriptions =
          prescriptionsRes.status === 'fulfilled'
            ? prescriptionsRes.value?.data || []
            : [];

        const bills =
          billingRes.status === 'fulfilled'
            ? billingRes.value?.data?.data || billingRes.value?.data || []
            : [];

        // Appointments calculations
        const completedApts = appointments.filter((a) => a.status === 'COMPLETED').length;
        const pendingApts = appointments.filter((a) => a.status === 'PENDING').length;
        const cancelledApts = appointments.filter((a) => a.status === 'CANCELLED').length;

        // Revenue calculations
        const paidRevenue = bills
          .filter((b) => b.status === 'PAID')
          .reduce((acc, b) => acc + (b.totalAmount || b.amount || 0), 0);

        // Specialization breakdown from doctors
        const specMap = {};
        doctors.forEach((d) => {
          const spec = d.specialization || 'General Practice';
          specMap[spec] = (specMap[spec] || 0) + 1;
        });

        const totalDocCount = doctors.length || 1;
        const specList = Object.entries(specMap).map(([name, count]) => ({
          name,
          count,
          share: `${Math.round((count / totalDocCount) * 100)}%`,
          color: '#0284c7',
        }));

        // Blood Group breakdown
        const bgMap = {};
        patients.forEach((p) => {
          if (p.bloodGroup) {
            bgMap[p.bloodGroup] = (bgMap[p.bloodGroup] || 0) + 1;
          }
        });

        setMetrics({
          totalPatients,
          totalDoctors: doctors.length,
          totalAppointments: appointments.length,
          completedAppointments: completedApts,
          pendingAppointments: pendingApts,
          cancelledAppointments: cancelledApts,
          totalPrescriptions: prescriptions.length,
          totalRevenue: paidRevenue,
          specializationBreakdown: specList,
          bloodGroupBreakdown: bgMap,
          recentConsultations: appointments.slice(0, 5),
        });
      } catch (err) {
        setErrorMsg('Failed to compile clinical analytics report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const completionRate =
    metrics.totalAppointments > 0
      ? Math.round((metrics.completedAppointments / metrics.totalAppointments) * 100)
      : 100;

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Spinner size={36} primary />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          Compiling Patient Management System Clinical Reports...
        </p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Healthcare Reports & Analytics</h1>
          <p className="page-subtitle">
            Authentic reporting compiled from live clinical visits, doctor rosters, and patient records.
          </p>
        </div>
        <div className="page-actions">
          <div className="dropdown-wrapper">
            <select
              className="form-select"
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              style={{ width: 'auto', paddingRight: '2rem' }}
            >
              <option value="month">Current Clinical Period</option>
              <option value="quarter">All-Time Live Data</option>
            </select>
          </div>
          <Button
            variant="primary"
            icon={Printer}
            onClick={handlePrintReport}
          >
            Print / Export Report
          </Button>
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Summary KPI Cards from real database */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {/* Total Patients */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Users size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-title">Registered Patients</div>
            <div className="stat-card-value">{metrics.totalPatients}</div>
            <div className="stat-card-trend" style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={14} /> Live database records
            </div>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <UserCheck size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-title">Active Doctors</div>
            <div className="stat-card-value">{metrics.totalDoctors}</div>
            <div className="stat-card-trend" style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={14} /> Full medical staff
            </div>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-title">Total Appointments</div>
            <div className="stat-card-value">{metrics.totalAppointments}</div>
            <div className="stat-card-trend" style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={14} /> {completionRate}% completed
            </div>
          </div>
        </div>

        {/* Prescriptions Issued */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <FileText size={22} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-title">Issued Prescriptions</div>
            <div className="stat-card-value">{metrics.totalPrescriptions}</div>
            <div className="stat-card-trend" style={{ color: '#64748b', fontSize: '0.8rem' }}>
              Verified clinical orders
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Doctor Specialization Volume */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UserCheck size={18} color="#0284c7" />
              Specialization Distribution
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Staff</span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {metrics.specializationBreakdown.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No doctors listed currently.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {metrics.specializationBreakdown.map((spec, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{spec.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{spec.count} Doctors ({spec.share})</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: spec.share,
                          background: 'linear-gradient(90deg, #0072F5, #38bdf8)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="#10b981" />
              Appointment Status Breakdown
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Counts</span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#047857' }}>Completed Visits</span>
                  <span style={{ fontWeight: 700 }}>{metrics.completedAppointments}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: metrics.totalAppointments > 0 ? `${(metrics.completedAppointments / metrics.totalAppointments) * 100}%` : '0%',
                      backgroundColor: '#10b981',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#b45309' }}>Pending Consultations</span>
                  <span style={{ fontWeight: 700 }}>{metrics.pendingAppointments}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: metrics.totalAppointments > 0 ? `${(metrics.pendingAppointments / metrics.totalAppointments) * 100}%` : '0%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#be123c' }}>Cancelled Visits</span>
                  <span style={{ fontWeight: 700 }}>{metrics.cancelledAppointments}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: metrics.totalAppointments > 0 ? `${(metrics.cancelledAppointments / metrics.totalAppointments) * 100}%` : '0%',
                      backgroundColor: '#ef4444',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
