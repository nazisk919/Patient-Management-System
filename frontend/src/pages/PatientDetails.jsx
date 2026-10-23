import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
  FileText,
  CreditCard,
  QrCode,
  Receipt,
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import AppointmentTable from '../components/appointments/AppointmentTable';
import AppointmentForm from '../components/appointments/AppointmentForm';
import patientService from '../services/patientService';
import appointmentService from '../services/appointmentService';
import prescriptionService from '../services/prescriptionService';
import billingService from '../services/billingService';
import PaymentModal from '../components/billing/PaymentModal';
import CreateBillModal from '../components/billing/CreateBillModal';
import { formatDate, calculateAge } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/constants';

export const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);
  const [createBillModalOpen, setCreateBillModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'appointments', 'prescriptions', 'billing'
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canEdit = hasRole(ROLES.ADMIN, ROLES.STAFF);
  const canDelete = hasRole(ROLES.ADMIN);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const [patientRes, appointmentsRes, prescriptionsRes, billsRes] = await Promise.allSettled([
          patientService.getPatientById(id),
          appointmentService.getAllAppointments({ patient: id }),
          prescriptionService.getAllPrescriptions({ patient: id }),
          billingService.getAllBills({ patient: id }),
        ]);

        if (patientRes.status === 'fulfilled' && patientRes.value?.data) {
          setPatient(patientRes.value.data);
        } else {
          throw new Error('Patient record not found');
        }

        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value?.data) {
          const allApts = appointmentsRes.value.data;
          // Filter by patient ID if backend returned all
          const patientApts = Array.isArray(allApts)
            ? allApts.filter((a) => (a.patient?._id || a.patient) === id)
            : [];
          setAppointments(patientApts);
        }

        if (prescriptionsRes.status === 'fulfilled' && prescriptionsRes.value?.data) {
          const allPres = prescriptionsRes.value.data;
          const patientPres = Array.isArray(allPres)
            ? allPres.filter((p) => (p.patient?._id || p.patient) === id)
            : [];
          setPrescriptions(patientPres);
        }

        if (billsRes.status === 'fulfilled' && billsRes.value?.data) {
          setBills(Array.isArray(billsRes.value.data) ? billsRes.value.data : []);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await patientService.deletePatient(id);
      success('Patient record deleted successfully.');
      navigate('/patients');
    } catch (err) {
      error(err.message || 'Failed to delete patient.');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const handleBookAppointment = async (formData) => {
    setBookLoading(true);
    try {
      await appointmentService.createAppointment({
        ...formData,
        patient: id,
      });
      success('Appointment booked successfully!');
      setBookModalOpen(false);

      // Refresh appointments
      const res = await appointmentService.getAllAppointments({ patient: id });
      const allApts = res?.data || [];
      setAppointments(allApts.filter((a) => (a.patient?._id || a.patient) === id));
    } catch (err) {
      error(err.message || 'Failed to schedule appointment.');
    } finally {
      setBookLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner size={36} primary />
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
          Loading patient profile...
        </p>
      </div>
    );
  }

  if (errorMsg || !patient) {
    return (
      <div>
        <Alert type="danger" message={errorMsg || 'Patient not found'} />
        <Link to="/patients" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Patients List</span>
        </Link>
      </div>
    );
  }

  const age = calculateAge(patient.dob);

  // BMI Calculation
  let bmi = null;
  let bmiCategory = null;
  if (patient.height && patient.weight && patient.height > 0) {
    const heightInMeters = patient.height / 100;
    bmi = (patient.weight / (heightInMeters * heightInMeters)).toFixed(1);
    if (bmi < 18.5) bmiCategory = { label: 'Underweight', color: 'warning' };
    else if (bmi < 25) bmiCategory = { label: 'Normal Weight', color: 'success' };
    else if (bmi < 30) bmiCategory = { label: 'Overweight', color: 'warning' };
    else bmiCategory = { label: 'Obese', color: 'danger' };
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        <Link to="/patients">Patients</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-slate-800)', fontWeight: 600 }}>
          {patient.firstName} {patient.lastName}
        </span>
      </div>

      {/* Hero Profile Header */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            padding: '2rem',
            color: 'white',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              {patient.firstName ? patient.firstName[0].toUpperCase() : 'P'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
                  {patient.firstName} {patient.lastName}
                </h1>
                <span
                  style={{
                    backgroundColor: 'white',
                    color: '#be123c',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Blood: {patient.bloodGroup}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '0.85rem',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'capitalize',
                  }}
                >
                  {patient.gender?.toLowerCase()} • {age} yrs
                </span>
              </div>
              <p style={{ marginTop: '0.4rem', opacity: 0.9, fontSize: '0.875rem' }}>
                Patient ID: {patient._id} • Registered on {formatDate(patient.createdAt)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {canEdit && (
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => setBookModalOpen(true)}
              >
                Schedule Appointment
              </Button>
            )}
            {canEdit && (
              <Link to={`/patients/edit/${patient._id}`} className="btn btn-secondary">
                <Edit size={16} />
                <span>Edit Profile</span>
              </Link>
            )}
            {canDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'white',
            padding: '0 1.5rem',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            className={`btn btn-ghost ${activeTab === 'overview' ? 'active' : ''}`}
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'overview' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              padding: '1rem 0.5rem',
            }}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Vitals
          </button>
          <button
            type="button"
            className={`btn btn-ghost ${activeTab === 'appointments' ? 'active' : ''}`}
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'appointments' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'appointments' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              padding: '1rem 0.5rem',
            }}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments ({appointments.length})
          </button>
          <button
            type="button"
            className={`btn btn-ghost ${activeTab === 'prescriptions' ? 'active' : ''}`}
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'prescriptions' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'prescriptions' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              padding: '1rem 0.5rem',
            }}
            onClick={() => setActiveTab('prescriptions')}
          >
            Prescriptions ({prescriptions.length})
          </button>
          <button
            type="button"
            className={`btn btn-ghost ${activeTab === 'billing' ? 'active' : ''}`}
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'billing' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'billing' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              padding: '1rem 0.5rem',
            }}
            onClick={() => setActiveTab('billing')}
          >
            Invoices & Bills ({bills.length})
          </button>
        </div>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Contact & Demographics Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <User size={18} color="var(--color-primary)" />
                Demographics & Contact
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Phone Number
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                    {patient.phone}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Emergency Contact
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-danger)', marginTop: '2px' }}>
                    {patient.emergencyContact}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Date of Birth
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>
                    {formatDate(patient.dob)} ({age} years old)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Residential Address
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>
                    {patient.address}
                  </div>
                </div>

                {patient.createdBy && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Registered By
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-700)', marginTop: '2px' }}>
                      {patient.createdBy.name} ({patient.createdBy.role})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Vitals & Physical Attributes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Activity size={18} color="var(--color-teal)" />
                Physical Vitals & Body Metrics
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    HEIGHT
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    {patient.height ? `${patient.height} cm` : 'Not recorded'}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    WEIGHT
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    {patient.weight ? `${patient.weight} kg` : 'Not recorded'}
                  </div>
                </div>
              </div>

              {bmi ? (
                <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Body Mass Index (BMI)</span>
                    <Badge variant={bmiCategory.color}>{bmiCategory.label}</Badge>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    {bmi} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg/m²</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Provide both height and weight to calculate Body Mass Index (BMI).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Appointments */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Consultation Appointments</h3>
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setBookModalOpen(true)}
              >
                Schedule Appointment
              </Button>
            )}
          </div>
          <AppointmentTable
            appointments={appointments}
            onEdit={() => {}}
            onDelete={async (aptId) => {
              try {
                await appointmentService.deleteAppointment(aptId);
                success('Appointment deleted.');
                setAppointments((prev) => prev.filter((a) => a._id !== aptId));
              } catch (err) {
                error(err.message);
              }
            }}
          />
        </div>
      )}

      {/* Tab Content: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Issued Prescriptions</h3>
          </div>
          <div className="card-body">
            {prescriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {prescriptions.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-slate-50)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Date: {formatDate(p.createdAt)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-teal)', fontWeight: 600 }}>
                        Doctor: {p.doctor?.name || 'Dr. Assigned'}
                      </span>
                    </div>
                    {p.medicines && p.medicines.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {p.medicines.map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: 'white',
                              border: '1px solid var(--border-color)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.825rem',
                            }}
                          >
                            <strong>{m.medicineName}</strong>: {m.dosage} ({m.frequency} for {m.duration})
                          </span>
                        ))}
                      </div>
                    )}
                    {p.notes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Clinical Notes: "{p.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No prescriptions found for this patient.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Invoices & Billing */}
      {activeTab === 'billing' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Patient Invoices & Online Payments</h3>
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setCreateBillModalOpen(true)}
              >
                Create Invoice
              </Button>
            )}
          </div>
          <div className="card-body">
            {bills.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Items & Services</th>
                      <th>Total Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => {
                      const isPaid = b.status === 'PAID';
                      return (
                        <tr key={b._id}>
                          <td>
                            <strong>#{b.invoiceNumber}</strong>
                            {b.transactionId && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Txn: {b.transactionId}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              {b.items?.[0]?.description}
                              {b.items?.length > 1 && ` (+${b.items.length - 1} more)`}
                            </div>
                            {b.doctor && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)' }}>
                                Dr. {b.doctor.name}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong style={{ fontSize: '1rem', color: 'var(--color-slate-900)' }}>
                              ₹{b.totalAmount?.toLocaleString()}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.825rem' }}>{formatDate(b.createdAt)}</div>
                          </td>
                          <td>
                            <Badge variant={isPaid ? 'success' : 'warning'}>
                              {isPaid ? 'PAID' : 'PENDING'}
                            </Badge>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {!isPaid ? (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                                onClick={() => setSelectedBillForPay(b)}
                              >
                                <QrCode size={14} />
                                <span>Pay on Phone</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                                onClick={() => setSelectedBillForPay(b)}
                              >
                                <Receipt size={14} />
                                <span>Receipt</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No invoices found for this patient.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Online Payment Modal */}
      {selectedBillForPay && (
        <PaymentModal
          isOpen={!!selectedBillForPay}
          onClose={() => setSelectedBillForPay(null)}
          bill={selectedBillForPay}
          onPaymentSuccess={() => {
            billingService.getAllBills({ patient: id }).then((res) => {
              if (res?.data) setBills(res.data);
            });
          }}
        />
      )}

      {/* Create Bill Modal */}
      <CreateBillModal
        isOpen={createBillModalOpen}
        onClose={() => setCreateBillModalOpen(false)}
        preselectedPatientId={patient._id}
        onBillCreated={(newBill) => {
          setBills((prev) => [newBill, ...prev]);
        }}
      />

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title={`Schedule Appointment for ${patient.firstName} ${patient.lastName}`}
        size="lg"
      >
        <AppointmentForm
          preselectedPatientId={patient._id}
          onSubmit={handleBookAppointment}
          onCancel={() => setBookModalOpen(false)}
          loading={bookLoading}
        />
      </Modal>

      {/* Delete Patient Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Patient Record"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteLoading}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)' }}>
          Are you sure you want to delete patient{' '}
          <strong>
            {patient.firstName} {patient.lastName}
          </strong>
          ? This action will remove all demographics from the database.
        </p>
      </Modal>
    </div>
  );
};

export default PatientDetails;
