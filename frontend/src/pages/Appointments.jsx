import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import AppointmentTable from '../components/appointments/AppointmentTable';
import AppointmentForm from '../components/appointments/AppointmentForm';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES, APPOINTMENT_STATUSES } from '../utils/constants';

export const Appointments = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const canManage = hasRole(ROLES.ADMIN, ROLES.STAFF);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await appointmentService.getAllAppointments(params);
      const data = res?.data || [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setActionLoading(true);
    try {
      await appointmentService.updateAppointment(appointmentId, { status: newStatus });
      success(`Appointment status updated to ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      error(err.message || 'Failed to update appointment status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingAppointment) {
        await appointmentService.updateAppointment(editingAppointment._id, formData);
        success('Appointment updated successfully!');
      } else {
        await appointmentService.createAppointment(formData);
        success('Appointment booked successfully!');
      }
      setModalOpen(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (err) {
      error(err.message || 'Failed to save appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (appointmentId) => {
    setActionLoading(true);
    try {
      await appointmentService.deleteAppointment(appointmentId);
      success('Appointment deleted successfully.');
      fetchAppointments();
    } catch (err) {
      error(err.message || 'Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Appointments' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'ALL') return true;
    return apt.status === statusFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">
            Schedule consultations, view doctor agendas, and track visit status
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchAppointments}
            disabled={loading}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {canManage && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingAppointment(null);
                setModalOpen(true);
              }}
            >
              Book Appointment
            </Button>
          )}
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Filter Tabs and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            padding: '0 1rem',
          }}
        >
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className="btn btn-ghost"
                style={{
                  borderRadius: 0,
                  borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.85rem 1rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAppointments();
            }}
            style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px' }}
          >
            <input
              type="text"
              placeholder="Search by reason or keyword..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              <Search size={16} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Appointments Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <Spinner size={32} primary />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
              Loading appointments schedule...
            </p>
          </div>
        ) : (
          <AppointmentTable
            appointments={filteredAppointments}
            onStatusChange={handleStatusChange}
            onEdit={(apt) => {
              setEditingAppointment(apt);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
            actionLoading={actionLoading}
          />
        )}
      </div>

      {/* Book/Edit Appointment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAppointment(null);
        }}
        title={editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        size="lg"
      >
        <AppointmentForm
          initialData={editingAppointment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingAppointment(null);
          }}
          loading={actionLoading}
          isEdit={!!editingAppointment}
        />
      </Modal>
    </div>
  );
};

export default Appointments;
