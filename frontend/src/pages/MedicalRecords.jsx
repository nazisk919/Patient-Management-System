import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Trash2, Calendar, UserCheck, User, Activity } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import medicalRecordService from '../services/medicalRecordService';
import patientService from '../services/patientService';
import doctorService from '../services/doctorService';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/constants';

export const MedicalRecords = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    symptoms: '',
    allergies: '',
    treatment: '',
    labReports: '',
    notes: '',
  });

  const canCreate = hasRole(ROLES.DOCTOR, ROLES.ADMIN);
  const canDelete = hasRole(ROLES.ADMIN);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await medicalRecordService.getAllMedicalRecords();
      setRecords(res?.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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
        diagnosis: '',
        symptoms: '',
        allergies: '',
        treatment: '',
        labReports: '',
        notes: '',
      });
      setModalOpen(true);
    } catch {
      error('Could not prepare medical record form.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.doctor || !formData.diagnosis) {
      error('Please fill required patient, doctor, and diagnosis fields.');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor,
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment.trim(),
        notes: formData.notes.trim(),
        symptoms: formData.symptoms ? formData.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
        labReports: formData.labReports ? formData.labReports.split(',').map((l) => l.trim()).filter(Boolean) : [],
      };
      await medicalRecordService.createMedicalRecord(payload);
      success('Medical record logged successfully!');
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      error(err.message || 'Failed to create medical record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await medicalRecordService.deleteMedicalRecord(id);
      success('Medical record deleted.');
      fetchRecords();
    } catch (err) {
      error(err.message || 'Failed to delete record.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Electronic Health Records (EHR)</h1>
          <p className="page-subtitle">
            Diagnostic reports, clinical evaluations, and patient treatment histories
          </p>
        </div>
        <div className="page-actions">
          {canCreate && (
            <Button variant="primary" icon={Plus} onClick={openCreateModal}>
              Log Medical Record
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
              Loading health records...
            </p>
          </div>
        ) : records.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Recorded Date</th>
                  <th>Patient</th>
                  <th>Attending Doctor</th>
                  <th>Diagnosis</th>
                  <th>Symptoms & Allergies</th>
                  <th>Treatment Plan</th>
                  {canDelete && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{formatDate(rec.createdAt)}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        EHR-{rec._id.substring(rec._id.length - 6)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {rec.patient?.firstName ? `${rec.patient.firstName} ${rec.patient.lastName}` : 'Patient'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-teal)' }}>
                        {rec.doctor?.name || 'Dr. Assigned'}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary-dark)' }}>{rec.diagnosis}</strong>
                      {rec.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rec.notes}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {rec.symptoms && rec.symptoms.length > 0 && (
                          <div style={{ fontSize: '0.78rem' }}>
                            <strong>Symptoms:</strong> {rec.symptoms.join(', ')}
                          </div>
                        )}
                        {rec.allergies && rec.allergies.length > 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-danger)' }}>
                            <strong>Allergies:</strong> {rec.allergies.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{rec.treatment || '—'}</span>
                    </td>
                    {canDelete && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-icon btn-danger-outline btn-sm"
                          onClick={() => handleDelete(rec._id)}
                          title="Delete Record"
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
            No electronic medical records found.
          </div>
        )}
      </div>

      {/* Log Medical Record Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Patient Medical Record"
        size="lg"
      >
        <form onSubmit={handleCreate}>
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
              <label className="form-label required">Attending Doctor</label>
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

          <div className="form-group">
            <label className="form-label required">Clinical Diagnosis</label>
            <input
              type="text"
              placeholder="e.g. Acute Bronchitis, Type 2 Diabetes, Hypertension"
              className="form-control"
              value={formData.diagnosis}
              onChange={(e) => setFormData((p) => ({ ...p, diagnosis: e.target.value }))}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Observed Symptoms (comma separated)</label>
              <input
                type="text"
                placeholder="Fever, Sore throat, Fatigue"
                className="form-control"
                value={formData.symptoms}
                onChange={(e) => setFormData((p) => ({ ...p, symptoms: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Known Allergies (comma separated)</label>
              <input
                type="text"
                placeholder="Penicillin, Dust, Latex"
                className="form-control"
                value={formData.allergies}
                onChange={(e) => setFormData((p) => ({ ...p, allergies: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Treatment Plan / Prescription Summary</label>
            <input
              type="text"
              placeholder="e.g. Amoxicillin 500mg, bed rest, hydration"
              className="form-control"
              value={formData.treatment}
              onChange={(e) => setFormData((p) => ({ ...p, treatment: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Internal Doctor Notes</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Follow up in 7 days if symptoms persist"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              Save Medical Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalRecords;
