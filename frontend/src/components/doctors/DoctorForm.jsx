import React, { useState, useEffect } from 'react';
import { UserCheck, Mail, Phone, Award, IndianRupee, Clock, Calendar, Save, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { DAYS_OF_WEEK } from '../../utils/constants';

export const DoctorForm = ({ initialData = null, onSubmit, onCancel, loading = false, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    qualification: '',
    phone: '',
    consultationFee: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday'],
    availableTime: {
      start: '09:00 AM',
      end: '05:00 PM',
    },
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        specialization: initialData.specialization || '',
        experience: initialData.experience !== undefined ? initialData.experience : '',
        qualification: initialData.qualification || '',
        phone: initialData.phone || '',
        consultationFee: initialData.consultationFee !== undefined ? initialData.consultationFee : '',
        availableDays: initialData.availableDays || ['Monday', 'Tuesday'],
        availableTime: {
          start: initialData.availableTime?.start || '09:00 AM',
          end: initialData.availableTime?.end || '05:00 PM',
        },
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('time.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        availableTime: { ...prev.availableTime, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.availableDays.includes(day);
      const newDays = exists
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: newDays };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Doctor name must be at least 3 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.specialization || formData.specialization.trim().length < 2) {
      errs.specialization = 'Specialization is required';
    }
    if (formData.experience === '' || isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      errs.experience = 'Experience must be a positive number';
    }
    if (!formData.qualification || formData.qualification.trim().length < 2) {
      errs.qualification = 'Qualification is required';
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
      errs.phone = 'Phone number must be at least 10 digits';
    }
    if (formData.consultationFee === '' || isNaN(Number(formData.consultationFee)) || Number(formData.consultationFee) < 0) {
      errs.consultationFee = 'Consultation fee must be a positive number';
    }
    if (formData.availableDays.length === 0) {
      errs.availableDays = 'Select at least one available day';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization.trim(),
        experience: Number(formData.experience),
        qualification: formData.qualification.trim(),
        phone: formData.phone.trim(),
        consultationFee: Number(formData.consultationFee),
        availableDays: formData.availableDays,
        availableTime: {
          start: formData.availableTime.start.trim(),
          end: formData.availableTime.end.trim(),
        },
      };
      await onSubmit(payload);
    } catch (err) {
      setServerError(err.message || 'Failed to save doctor profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <Alert type="danger" message={serverError} onClose={() => setServerError('')} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <UserCheck size={20} color="var(--color-primary)" />
            Doctor Information
          </h3>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="docName">Full Name</label>
              <input
                id="docName"
                name="name"
                type="text"
                placeholder="e.g. Dr. Emily Watson"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="docEmail">Email Address</label>
              <input
                id="docEmail"
                name="email"
                type="email"
                placeholder="e.g. emily.watson@hospital.com"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="docSpec">Specialization</label>
              <input
                id="docSpec"
                name="specialization"
                type="text"
                placeholder="e.g. Cardiologist, Neurologist, Pediatrics"
                className={`form-control ${errors.specialization ? 'is-invalid' : ''}`}
                value={formData.specialization}
                onChange={handleChange}
              />
              {errors.specialization && <div className="invalid-feedback">{errors.specialization}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="docQual">Qualification</label>
              <input
                id="docQual"
                name="qualification"
                type="text"
                placeholder="e.g. MBBS, MD, FRCP"
                className={`form-control ${errors.qualification ? 'is-invalid' : ''}`}
                value={formData.qualification}
                onChange={handleChange}
              />
              {errors.qualification && <div className="invalid-feedback">{errors.qualification}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="docExp">Experience (Years)</label>
              <input
                id="docExp"
                name="experience"
                type="number"
                placeholder="e.g. 12"
                className={`form-control ${errors.experience ? 'is-invalid' : ''}`}
                value={formData.experience}
                onChange={handleChange}
              />
              {errors.experience && <div className="invalid-feedback">{errors.experience}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="docPhone">Phone</label>
              <input
                id="docPhone"
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="docFee">Consultation Fee (₹)</label>
              <input
                id="docFee"
                name="consultationFee"
                type="number"
                placeholder="e.g. 150"
                className={`form-control ${errors.consultationFee ? 'is-invalid' : ''}`}
                value={formData.consultationFee}
                onChange={handleChange}
              />
              {errors.consultationFee && <div className="invalid-feedback">{errors.consultationFee}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required">Schedule Hours</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  name="time.start"
                  type="text"
                  placeholder="e.g. 09:00 AM"
                  className="form-control"
                  value={formData.availableTime.start}
                  onChange={handleChange}
                />
                <input
                  name="time.end"
                  type="text"
                  placeholder="e.g. 05:00 PM"
                  className="form-control"
                  value={formData.availableTime.end}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label className="form-label required">Available Days</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {DAYS_OF_WEEK.map((day) => {
                const selected = formData.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {errors.availableDays && (
              <div className="invalid-feedback" style={{ display: 'block', marginTop: '0.4rem' }}>
                {errors.availableDays}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={Save} loading={loading}>
          {isEdit ? 'Update Doctor' : 'Save Doctor'}
        </Button>
      </div>
    </form>
  );
};

export default DoctorForm;
