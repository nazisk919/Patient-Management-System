import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Trash2, Calendar, User, Clock } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import prescriptionService from '../services/prescriptionService';
import patientService from '../services/patientService';
import doctorService from '../services/doctorService';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/constants';

export const Prescriptions = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    notes: '',
    medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '' }],
  });

  const canCreate = hasRole(ROLES.DOCTOR, ROLES.ADMIN);
  const canDelete = hasRole(ROLES.ADMIN);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await prescriptionService.getAllPrescriptions();
      setPrescriptions(res?.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const openCreateModal = async () => {
    try {
      const [ptRes, docRes] = await Promise.all([
        patientService.getAllPatients({ limit: 100 }),
        doctorService.getAllDoctors({ limit: 100 }),
      ]);
      setPatients(ptRes?.data?.data || ptRes?.data || []);
      setDoctors(docRes?.data || []);
      setFormData({
        patient: '',
        doctor: '',
        notes: '',
        medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '' }],
      });
      setModalOpen(true);
    } catch (err) {
      error('Could not prepare prescription form.');
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, medicines: updated }));
  };

  const addMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: '', dosage: '', frequency: '', duration: '' }],
    }));
  };

  const removeMedicineRow = (index) => {
    if (formData.medicines.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.doctor) {
      error('Please select both a patient and a doctor.');
      return;
    }
    setFormLoading(true);
    try {
      await prescriptionService.createPrescription(formData);
      success('Prescription created successfully!');
      setModalOpen(false);
      fetchPrescriptions();
    } catch (err) {
      error(err.message || 'Failed to create prescription.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      await prescriptionService.deletePrescription(id);
      success('Prescription deleted.');
      fetchPrescriptions();
    } catch (err) {
      error(err.message || 'Failed to delete prescription.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">
            Medication orders, dosage frequencies, and clinical prescription history
          </p>
        </div>
        <div className="page-actions">
          {canCreate && (
            <Button variant="primary" icon={Plus} onClick={openCreateModal}>
              Issue Prescription
            </Button>
          )}
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <Spinner size={32} primary />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
              Loading prescriptions...
            </p>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Prescription Date</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Medicines</th>
                  <th>Clinical Notes</th>
                  {canDelete && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((pr) => (
                  <tr key={pr._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{formatDate(pr.createdAt)}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {pr._id.substring(pr._id.length - 6)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {pr.patient?.firstName ? `${pr.patient.firstName} ${pr.patient.lastName}` : 'Patient'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-teal)' }}>
                        {pr.doctor?.name || 'Dr. Assigned'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {pr.medicines?.map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--color-slate-100)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <strong>{m.medicineName}</strong> - {m.dosage} ({m.frequency}, {m.duration})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {pr.notes || '—'}
                      </span>
                    </td>
                    {canDelete && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-icon btn-danger-outline btn-sm"
                          onClick={() => handleDeletePrescription(pr._id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            No prescriptions recorded yet.
          </div>
        )}
      </div>

      {/* Issue Prescription Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue New Prescription"
        size="lg"
      >
        <form onSubmit={handleCreatePrescription}>
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label required">Patient</label>
              <select
                className="form-select"
                value={formData.patient}
                onChange={(e) => setFormData((p) => ({ ...p, patient: e.target.value }))}
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map((pt) => (
                  <option key={pt._id} value={pt._id}>
                    {pt.firstName} {pt.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Doctor</label>
              <select
                className="form-select"
                value={formData.doctor}
                onChange={(e) => setFormData((p) => ({ ...p, doctor: e.target.value }))}
                required
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label required">Prescribed Medicines</label>
              <Button type="button" variant="secondary" size="sm" onClick={addMedicineRow}>
                + Add Medicine
              </Button>
            </div>
            {formData.medicines.map((med, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  placeholder="Medicine name"
                  className="form-control"
                  value={med.medicineName}
                  onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  className="form-control"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Freq (Twice/day)"
                  className="form-control"
                  value={med.frequency}
                  onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Duration (5 days)"
                  className="form-control"
                  value={med.duration}
                  onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => removeMedicineRow(idx)}
                  disabled={formData.medicines.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Notes / Instructions</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Take after meals, plenty of hydration"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              Save Prescription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Prescriptions;
