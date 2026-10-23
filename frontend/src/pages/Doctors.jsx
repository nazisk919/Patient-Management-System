import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, Clock, Award, IndianRupee, Trash2, Edit } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import DoctorForm from '../components/doctors/DoctorForm';
import doctorService from '../services/doctorService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/constants';

export const Doctors = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const canManage = hasRole(ROLES.ADMIN);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const res = await doctorService.getAllDoctors(params);
      const data = res?.data || [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingDoctor) {
        await doctorService.updateDoctor(editingDoctor._id, formData);
        success('Doctor profile updated successfully!');
      } else {
        await doctorService.createDoctor(formData);
        success('Doctor registered successfully!');
      }
      setModalOpen(false);
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      error(err.message || 'Failed to save doctor.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    setFormLoading(true);
    try {
      await doctorService.deleteDoctor(doctorToDelete._id);
      success('Doctor removed successfully.');
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err) {
      error(err.message || 'Failed to delete doctor.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Staff & Doctors</h1>
          <p className="page-subtitle">
            Specialists, attending physicians, and clinical consultation schedules
          </p>
        </div>
        <div className="page-actions">
          {canManage && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingDoctor(null);
                setModalOpen(true);
              }}
            >
              Add Doctor
            </Button>
          )}
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchDoctors();
            }}
            style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px' }}
          >
            <input
              type="text"
              placeholder="Search by name or specialization..."
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner size={32} primary />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
            Loading doctor profiles...
          </p>
        </div>
      ) : doctors.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {doctors.map((doc) => (
            <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-body" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}
                  >
                    {doc.name ? doc.name[0].toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                      {doc.name}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.8rem',
                        color: 'var(--color-teal)',
                        fontWeight: 600,
                      }}
                    >
                      {doc.specialization}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-600)' }}>
                    <Award size={15} color="var(--color-slate-400)" />
                    <span>{doc.qualification} • {doc.experience} yrs exp.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-600)' }}>
                    <Mail size={15} color="var(--color-slate-400)" />
                    <span>{doc.email}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-600)' }}>
                    <Phone size={15} color="var(--color-slate-400)" />
                    <span>{doc.phone}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-600)' }}>
                    <IndianRupee size={15} color="var(--color-slate-400)" />
                    <span>Fee: <strong>₹{doc.consultationFee}</strong></span>
                  </div>

                  {doc.availableTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-600)' }}>
                      <Clock size={15} color="var(--color-slate-400)" />
                      <span>{doc.availableTime.start} - {doc.availableTime.end}</span>
                    </div>
                  )}

                  {doc.availableDays && doc.availableDays.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        AVAILABLE DAYS:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {doc.availableDays.map((d, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: 'var(--color-slate-100)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-slate-700)',
                            }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="card-footer" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Edit}
                    onClick={() => {
                      setEditingDoctor(doc);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger-outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => {
                      setDoctorToDelete(doc);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No doctors found matching criteria.</p>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDoctor(null);
        }}
        title={editingDoctor ? 'Edit Doctor' : 'Register New Doctor'}
        size="lg"
      >
        <DoctorForm
          initialData={editingDoctor}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingDoctor(null);
          }}
          loading={formLoading}
          isEdit={!!editingDoctor}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Doctor Removal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteDoctor} loading={formLoading}>
              Delete Doctor
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)' }}>
          Are you sure you want to remove <strong>{doctorToDelete?.name}</strong> from the medical directory?
        </p>
      </Modal>
    </div>
  );
};

export default Doctors;
