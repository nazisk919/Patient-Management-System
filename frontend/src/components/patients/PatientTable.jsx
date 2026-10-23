import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Phone, Calendar, User } from 'lucide-react';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { formatDate, calculateAge } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export const PatientTable = ({
  patients = [],
  pagination = {},
  onPageChange,
  onDelete,
  deleteLoading = false,
}) => {
  const { hasRole } = useAuth();
  const [patientToDelete, setPatientToDelete] = useState(null);

  const canEdit = hasRole(ROLES.ADMIN, ROLES.STAFF);
  const canDelete = hasRole(ROLES.ADMIN);

  const confirmDelete = async () => {
    if (patientToDelete && onDelete) {
      await onDelete(patientToDelete._id);
      setPatientToDelete(null);
    }
  };

  if (!patients || patients.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No patients found"
        description="Try adjusting your search criteria or register a new patient."
      />
    );
  }

  const { currentPage = 1, totalPages = 1, totalRecords = patients.length } = pagination;

  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Gender & Age</th>
              <th>Blood Group</th>
              <th>Contact</th>
              <th>City / Address</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const age = calculateAge(patient.dob);
              return (
                <tr key={patient._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                        }}
                      >
                        {patient.firstName ? patient.firstName[0].toUpperCase() : 'P'}
                      </div>
                      <div>
                        <Link
                          to={`/patients/${patient._id}`}
                          style={{
                            fontWeight: 700,
                            color: 'var(--color-slate-900)',
                            display: 'block',
                          }}
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {patient._id.substring(patient._id.length - 6)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {patient.gender ? patient.gender.toLowerCase() : 'N/A'}
                      </span>
                      {age !== 'N/A' && (
                        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({age} yrs)
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="blood-badge">{patient.bloodGroup || 'N/A'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={13} color="var(--color-slate-400)" />
                      <span>{patient.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        maxWidth: '180px',
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={patient.address}
                    >
                      {patient.address || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {formatDate(patient.createdAt)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <Link
                        to={`/patients/${patient._id}`}
                        className="btn-icon btn-secondary btn-sm"
                        title="View Patient Details"
                      >
                        <Eye size={15} />
                      </Link>

                      {canEdit && (
                        <Link
                          to={`/patients/edit/${patient._id}`}
                          className="btn-icon btn-secondary btn-sm"
                          title="Edit Patient"
                        >
                          <Edit size={15} />
                        </Link>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          className="btn-icon btn-danger-outline btn-sm"
                          onClick={() => setPatientToDelete(patient)}
                          title="Delete Patient"
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

      {totalPages > 1 && (
        <div className="card-footer">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalRecords} records)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        title="Confirm Patient Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPatientToDelete(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteLoading}
            >
              Delete Patient
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem' }}>
          Are you sure you want to permanently delete patient{' '}
          <strong>
            {patientToDelete?.firstName} {patientToDelete?.lastName}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default PatientTable;
