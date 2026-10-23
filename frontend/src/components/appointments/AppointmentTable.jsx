import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Phone,
} from 'lucide-react';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { APPOINTMENT_STATUSES, ROLES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export const AppointmentTable = ({
  appointments = [],
  onStatusChange,
  onEdit,
  onDelete,
  actionLoading = false,
}) => {
  const { hasRole } = useAuth();
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [viewAppointment, setViewAppointment] = useState(null);

  const canManage = hasRole(ROLES.ADMIN, ROLES.STAFF);
  const canDelete = hasRole(ROLES.ADMIN);

  const confirmDelete = async () => {
    if (appointmentToDelete && onDelete) {
      await onDelete(appointmentToDelete._id);
      setAppointmentToDelete(null);
    }
  };

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No appointments scheduled"
        description="There are currently no appointments matching this view."
      />
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => {
              const statusConfig = APPOINTMENT_STATUSES[apt.status] || {
                label: apt.status,
                color: 'neutral',
              };

              return (
                <tr
                  key={apt._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setViewAppointment(apt)}
                  title="Click to view appointment details"
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                        }}
                      >
                        {apt.patient?.firstName ? apt.patient.firstName[0].toUpperCase() : 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>
                          {apt.patient?.firstName ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {apt.patient?.phone || 'No Phone'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>
                        {apt.doctor?.name || 'Dr. Assigned'}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-teal)' }}>
                        {apt.doctor?.specialization || 'General'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Calendar size={13} color="var(--color-slate-400)" />
                        <span>{formatDate(apt.appointmentDate)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} color="var(--color-slate-400)" />
                        <span>{apt.appointmentTime}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      <span style={{ fontWeight: 500 }}>{apt.reason}</span>
                      {apt.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          "{apt.notes}"
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn-icon btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewAppointment(apt);
                        }}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>

                      {canManage && onStatusChange && (
                        <>
                          {apt.status === 'PENDING' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{ color: 'var(--color-primary)' }}
                              title="Confirm Appointment"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(apt._id, 'CONFIRMED');
                              }}
                              disabled={actionLoading}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {apt.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{ color: 'var(--color-success)' }}
                              title="Mark as Completed"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(apt._id, 'COMPLETED');
                              }}
                              disabled={actionLoading}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{ color: 'var(--color-danger)' }}
                              title="Cancel Appointment"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(apt._id, 'CANCELLED');
                              }}
                              disabled={actionLoading}
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </>
                      )}

                      {canManage && onEdit && (
                        <button
                          type="button"
                          className="btn-icon btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(apt);
                          }}
                          title="Edit Appointment"
                          disabled={actionLoading}
                        >
                          <Edit3 size={15} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          className="btn-icon btn-danger-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAppointmentToDelete(apt);
                          }}
                          title="Delete Appointment"
                          disabled={actionLoading}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Appointment View Details Modal */}
      <Modal
        isOpen={!!viewAppointment}
        onClose={() => setViewAppointment(null)}
        title="Appointment Consultation Details"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between' }}>
            {viewAppointment?.patient?._id && (
              <Link
                to={`/patients/${viewAppointment.patient._id}`}
                className="btn btn-secondary btn-sm"
                onClick={() => setViewAppointment(null)}
              >
                <User size={14} />
                <span>Patient Profile</span>
              </Link>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewAppointment(null)}
              >
                Close
              </Button>
              {canManage && onEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => {
                    const toEdit = viewAppointment;
                    setViewAppointment(null);
                    onEdit(toEdit);
                  }}
                >
                  Edit Appointment
                </Button>
              )}
            </div>
          </div>
        }
      >
        {viewAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--color-slate-50)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Patient Information
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  {viewAppointment.patient?.firstName
                    ? `${viewAppointment.patient.firstName} ${viewAppointment.patient.lastName}`
                    : 'Unknown Patient'}
                </div>
                {viewAppointment.patient?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <Phone size={13} />
                    <span>{viewAppointment.patient.phone}</span>
                  </div>
                )}
              </div>
              <div>
                {(() => {
                  const sc = APPOINTMENT_STATUSES[viewAppointment.status] || {
                    label: viewAppointment.status,
                    color: 'neutral',
                  };
                  return <Badge variant={sc.color}>{sc.label}</Badge>;
                })()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Assigned Doctor
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                  {viewAppointment.doctor?.name || 'Dr. Assigned'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)' }}>
                  {viewAppointment.doctor?.specialization || 'General Practice'}
                </div>
              </div>

              <div style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Date & Time
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                  {formatDate(viewAppointment.appointmentDate)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {viewAppointment.appointmentTime}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Reason for Consultation
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', marginTop: '4px', fontSize: '0.9rem' }}>
                {viewAppointment.reason}
              </div>
            </div>

            {viewAppointment.notes && (
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Clinical Notes
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{viewAppointment.notes}"
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!appointmentToDelete}
        onClose={() => setAppointmentToDelete(null)}
        title="Confirm Appointment Cancellation"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAppointmentToDelete(null)}
              disabled={actionLoading}
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={actionLoading}
            >
              Delete Appointment
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem' }}>
          Are you sure you want to delete this appointment for{' '}
          <strong>
            {appointmentToDelete?.patient?.firstName} {appointmentToDelete?.patient?.lastName}
          </strong>{' '}
          on {formatDate(appointmentToDelete?.appointmentDate)}?
        </p>
      </Modal>
    </>
  );
};

export default AppointmentTable;
