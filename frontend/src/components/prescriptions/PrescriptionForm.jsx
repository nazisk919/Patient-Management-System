import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  UserCheck,
  Calendar,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Pill,
  Clock,
} from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import patientService from '../../services/patientService';
import doctorService from '../../services/doctorService';
import appointmentService from '../../services/appointmentService';
import { formatDate } from '../../utils/formatDate';

export const PrescriptionForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    appointment: '',
    patient: '',
    doctor: '',
    notes: '',
    medicines: [
      { medicineName: '', dosage: '', frequency: '', duration: '' },
    ],
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const loadDependencies = async () => {
      setDataLoading(true);
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          patientService.getAllPatients({ limit: 100 }),
          doctorService.getAllDoctors({ limit: 100 }),
          appointmentService.getAllAppointments({ limit: 100 }),
        ]);

        const ptList = patientsRes?.data?.data || patientsRes?.data || [];
        const docList = doctorsRes?.data || [];
        const aptList = appointmentsRes?.data || [];

        setPatients(ptList);
        setDoctors(docList);
        setAppointments(aptList);

        // Pre-fill defaults if not editing
        if (!initialData && aptList.length > 0) {
          const firstApt = aptList[0];
          setFormData((prev) => ({
            ...prev,
            appointment: firstApt._id,
            patient: firstApt.patient?._id || firstApt.patient || '',
            doctor: firstApt.doctor?._id || firstApt.doctor || '',
          }));
        } else if (ptList.length > 0 && docList.length > 0 && !initialData) {
          setFormData((prev) => ({
            ...prev,
            patient: ptList[0]._id,
            doctor: docList[0]._id,
          }));
        }
      } catch (err) {
        setServerError('Failed to load patients, doctors, or appointments list.');
      } finally {
        setDataLoading(false);
      }
    };

    loadDependencies();
  }, [initialData]);

  // Handle appointment selection to auto-sync patient and doctor
  const handleAppointmentChange = (e) => {
    const aptId = e.target.value;
    const selectedApt = appointments.find((a) => a._id === aptId);

    if (selectedApt) {
      setFormData((prev) => ({
        ...prev,
        appointment: aptId,
        patient: selectedApt.patient?._id || selectedApt.patient || prev.patient,
        doctor: selectedApt.doctor?._id || selectedApt.doctor || prev.doctor,
      }));
    } else {
      setFormData((prev) => ({ ...prev, appointment: aptId }));
    }

    if (errors.appointment) {
      setErrors((prev) => ({ ...prev, appointment: '' }));
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
      medicines: [
        ...prev.medicines,
        { medicineName: '', dosage: '', frequency: '', duration: '' },
      ],
    }));
  };

  const removeMedicineRow = (index) => {
    if (formData.medicines.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.appointment) {
      errs.appointment = 'Please select an appointment';
    }
    if (!formData.patient) {
      errs.patient = 'Please select a patient';
    }
    if (!formData.doctor) {
      errs.doctor = 'Please select a doctor';
    }

    let hasValidMedicine = false;
    for (let i = 0; i < formData.medicines.length; i++) {
      const med = formData.medicines[i];
      if (med.medicineName.trim() && med.dosage.trim()) {
        hasValidMedicine = true;
      }
    }

    if (!hasValidMedicine) {
      errs.medicines = 'Please provide at least one medicine with name and dosage';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    // Filter out completely blank medicine rows
    const cleanedMedicines = formData.medicines
      .filter((m) => m.medicineName.trim())
      .map((m) => ({
        medicineName: m.medicineName.trim(),
        dosage: m.dosage.trim() || 'As directed',
        frequency: m.frequency.trim() || 'Once daily',
        duration: m.duration.trim() || '5 days',
      }));

    if (cleanedMedicines.length === 0) {
      setErrors({ medicines: 'Please add at least one medication' });
      return;
    }

    const payload = {
      appointment: formData.appointment,
      patient: formData.patient,
      doctor: formData.doctor,
      medicines: cleanedMedicines,
      notes: formData.notes.trim(),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setServerError(err.message || 'Failed to issue prescription.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {serverError && <Alert type="danger" message={serverError} onClose={() => setServerError('')} />}

      {/* Appointment Selection */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} color="var(--color-primary)" />
          Consultation & Appointment Link
        </h4>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {/* Select Appointment */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Associated Appointment</label>
            <select
              name="appointment"
              className={`form-select ${errors.appointment ? 'is-invalid' : ''}`}
              value={formData.appointment}
              onChange={handleAppointmentChange}
              disabled={dataLoading}
            >
              <option value="">-- Choose Appointment --</option>
              {appointments.map((apt) => (
                <option key={apt._id} value={apt._id}>
                  {apt.patient?.firstName ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Patient'} - {formatDate(apt.appointmentDate)} ({apt.appointmentTime || '10:00 AM'})
                </option>
              ))}
            </select>
            {errors.appointment && <div className="invalid-feedback">{errors.appointment}</div>}
          </div>

          {/* Select Patient */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Patient</label>
            <select
              name="patient"
              className={`form-select ${errors.patient ? 'is-invalid' : ''}`}
              value={formData.patient}
              onChange={handleFieldChange}
              disabled={dataLoading}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.phone})
                </option>
              ))}
            </select>
            {errors.patient && <div className="invalid-feedback">{errors.patient}</div>}
          </div>

          {/* Select Doctor */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label required">Doctor</label>
            <select
              name="doctor"
              className={`form-select ${errors.doctor ? 'is-invalid' : ''}`}
              value={formData.doctor}
              onChange={handleFieldChange}
              disabled={dataLoading}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name} ({d.specialization})
                </option>
              ))}
            </select>
            {errors.doctor && <div className="invalid-feedback">{errors.doctor}</div>}
          </div>
        </div>
      </div>

      {/* Medications List */}
      <div className="card" style={{ padding: '1.25rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Pill size={16} color="var(--color-primary)" />
            Prescribed Medications
          </h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={addMedicineRow}
          >
            Add Drug
          </Button>
        </div>

        {errors.medicines && (
          <div className="invalid-feedback" style={{ display: 'block', marginBottom: '0.75rem' }}>
            {errors.medicines}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {formData.medicines.map((med, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 2fr) minmax(100px, 1fr) minmax(110px, 1fr) minmax(90px, 1fr) 36px',
                gap: '0.5rem',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #f1f5f9',
              }}
            >
              <div>
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Paracetamol 500mg)"
                  className="form-control"
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
                  value={med.medicineName}
                  onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Dosage (e.g. 1 Tab)"
                  className="form-control"
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Frequency (e.g. 2x Daily)"
                  className="form-control"
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
                  value={med.frequency}
                  onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Duration (e.g. 5 Days)"
                  className="form-control"
                  style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
                  value={med.duration}
                  onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => removeMedicineRow(index)}
                  disabled={formData.medicines.length <= 1}
                  className="btn btn-ghost"
                  style={{
                    padding: '6px',
                    color: formData.medicines.length <= 1 ? '#cbd5e1' : '#ef4444',
                    cursor: formData.medicines.length <= 1 ? 'not-allowed' : 'pointer',
                  }}
                  title="Remove medication"
                  aria-label="Remove medication"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Notes & Instructions */}
      <div className="card" style={{ padding: '1.25rem', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} color="var(--color-primary)" />
          Clinical Instructions & Advice
        </h4>
        <textarea
          name="notes"
          rows={3}
          placeholder="e.g. Take after meals with warm water. Avoid cold drinks. Review after 5 days."
          className="form-textarea"
          value={formData.notes}
          onChange={handleFieldChange}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
        <Button
          type="button"
          variant="secondary"
          icon={ArrowLeft}
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={Save}
          loading={loading}
        >
          Issue Prescription
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionForm;
