import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, UserCheck, FileText, ArrowLeft, Save } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import patientService from '../../services/patientService';
import doctorService from '../../services/doctorService';
import { APPOINTMENT_STATUSES } from '../../utils/constants';
import { toInputDateFormat } from '../../utils/formatDate';

export const AppointmentForm = ({
  initialData = null,
  preselectedPatientId = null,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [formData, setFormData] = useState({
    patient: preselectedPatientId || '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '10:00 AM',
    reason: '',
    notes: '',
    status: 'PENDING',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setFetchLoading(true);
        const [patientsRes, doctorsRes] = await Promise.all([
          patientService.getAllPatients({ limit: 100 }),
          doctorService.getAllDoctors({ limit: 100 }),
        ]);

        const patientsList = patientsRes?.data?.data || patientsRes?.data || [];
        const doctorsList = doctorsRes?.data || [];

        setPatients(patientsList);
        setDoctors(doctorsList);

        if (!preselectedPatientId && patientsList.length > 0 && !initialData) {
          setFormData((prev) => ({ ...prev, patient: patientsList[0]._id }));
        }
        if (doctorsList.length > 0 && !initialData) {
          setFormData((prev) => ({ ...prev, doctor: doctorsList[0]._id }));
        }
      } catch (err) {
        setServerError('Failed to load doctors or patients list.');
      } finally {
        setFetchLoading(false);
      }
    };

    loadDependencies();
  }, [preselectedPatientId, initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        patient: initialData.patient?._id || initialData.patient || '',
        doctor: initialData.doctor?._id || initialData.doctor || '',
        appointmentDate: toInputDateFormat(initialData.appointmentDate),
        appointmentTime: initialData.appointmentTime || '10:00 AM',
        reason: initialData.reason || '',
        notes: initialData.notes || '',
        status: initialData.status || 'PENDING',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.patient) errs.patient = 'Please select a patient';
    if (!formData.doctor) errs.doctor = 'Please select a doctor';
    if (!formData.appointmentDate) errs.appointmentDate = 'Appointment date is required';
    if (!formData.appointmentTime) errs.appointmentTime = 'Appointment time is required';
    if (!formData.reason || formData.reason.trim().length < 3) {
      errs.reason = 'Reason must be at least 3 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      await onSubmit({
        patient: formData.patient,
        doctor: formData.doctor,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime.trim(),
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
        ...(isEdit && { status: formData.status }),
      });
    } catch (err) {
      setServerError(err.message || 'Failed to save appointment');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <Alert type="danger" message={serverError} onClose={() => setServerError('')} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} color="var(--color-primary)" />
            {isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h3>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="patient">
                Patient
              </label>
              <select
                id="patient"
                name="patient"
                className={`form-select ${errors.patient ? 'is-invalid' : ''}`}
                value={formData.patient}
                onChange={handleChange}
                disabled={!!preselectedPatientId && !isEdit}
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

            <div className="form-group">
              <label className="form-label required" htmlFor="doctor">
                Attending Doctor
              </label>
              <select
                id="doctor"
                name="doctor"
                className={`form-select ${errors.doctor ? 'is-invalid' : ''}`}
                value={formData.doctor}
                onChange={handleChange}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.specialization} (₹{d.consultationFee})
                  </option>
                ))}
              </select>
              {errors.doctor && <div className="invalid-feedback">{errors.doctor}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="appointmentDate">
                Appointment Date
              </label>
              <input
                id="appointmentDate"
                name="appointmentDate"
                type="date"
                className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                value={formData.appointmentDate}
                onChange={handleChange}
              />
              {errors.appointmentDate && (
                <div className="invalid-feedback">{errors.appointmentDate}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="appointmentTime">
                Appointment Time
              </label>
              <input
                id="appointmentTime"
                name="appointmentTime"
                type="text"
                placeholder="e.g. 10:30 AM or 02:00 PM"
                className={`form-control ${errors.appointmentTime ? 'is-invalid' : ''}`}
                value={formData.appointmentTime}
                onChange={handleChange}
              />
              {errors.appointmentTime && (
                <div className="invalid-feedback">{errors.appointmentTime}</div>
              )}
            </div>

            {isEdit && (
              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {Object.entries(APPOINTMENT_STATUSES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label required" htmlFor="reason">
              Reason for Visit / Chief Complaint
            </label>
            <input
              id="reason"
              name="reason"
              type="text"
              placeholder="e.g. High fever, routine checkup, persistent cough"
              className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
              value={formData.reason}
              onChange={handleChange}
            />
            {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">
              Internal Clinical Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="e.g. First consultation, referred by Dr. Smith"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <Button
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
          loading={loading || fetchLoading}
        >
          {isEdit ? 'Update Appointment' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
