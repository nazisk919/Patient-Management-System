import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, Heart, ArrowLeft, Save } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { GENDERS, BLOOD_GROUPS } from '../../utils/constants';
import { toInputDateFormat } from '../../utils/formatDate';

export const PatientForm = ({
  initialData = null,
  onSubmit,
  onCancel = null,
  loading = false,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dob: '',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    height: '',
    weight: '',
    emergencyContact: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        gender: initialData.gender || 'MALE',
        dob: toInputDateFormat(initialData.dob),
        phone: initialData.phone || '',
        address: initialData.address || '',
        bloodGroup: initialData.bloodGroup || 'O+',
        height: initialData.height !== undefined && initialData.height !== null ? initialData.height : '',
        weight: initialData.weight !== undefined && initialData.weight !== null ? initialData.weight : '',
        emergencyContact: initialData.emergencyContact || '',
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
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errs.firstName = 'First name must be at least 2 characters';
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errs.lastName = 'Last name must be at least 2 characters';
    }
    if (!formData.gender) {
      errs.gender = 'Gender is required';
    }
    if (!formData.dob) {
      errs.dob = 'Date of birth is required';
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
      errs.phone = 'Phone number must be at least 10 digits';
    }
    if (!formData.address || formData.address.trim().length < 5) {
      errs.address = 'Address must be at least 5 characters';
    }
    if (!formData.bloodGroup) {
      errs.bloodGroup = 'Blood group is required';
    }
    if (!formData.emergencyContact || formData.emergencyContact.trim().length < 10) {
      errs.emergencyContact = 'Emergency contact must be at least 10 digits';
    }
    if (formData.height && isNaN(Number(formData.height))) {
      errs.height = 'Height must be a valid number';
    }
    if (formData.weight && isNaN(Number(formData.weight))) {
      errs.weight = 'Weight must be a valid number';
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        dob: formData.dob,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact.trim(),
      };
      if (formData.height !== '') {
        payload.height = Number(formData.height);
      }
      if (formData.weight !== '') {
        payload.weight = Number(formData.weight);
      }

      await onSubmit(payload);
    } catch (err) {
      setServerError(err.message || 'Failed to save patient record. Please check inputs.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <Alert type="danger" message={serverError} onClose={() => setServerError('')} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <User size={20} color="var(--color-primary)" />
            Personal Information
          </h3>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="e.g. John"
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="e.g. Doe"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                value={formData.gender}
                onChange={handleChange}
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="dob">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                value={formData.dob}
                onChange={handleChange}
              />
              {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Heart size={20} color="var(--color-danger)" />
            Medical & Contact Details
          </h3>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="bloodGroup">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                className={`form-select ${errors.bloodGroup ? 'is-invalid' : ''}`}
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && <div className="invalid-feedback">{errors.bloodGroup}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
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
              <label className="form-label required" htmlFor="emergencyContact">
                Emergency Contact Number
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="tel"
                placeholder="e.g. 9876543211"
                className={`form-control ${errors.emergencyContact ? 'is-invalid' : ''}`}
                value={formData.emergencyContact}
                onChange={handleChange}
              />
              {errors.emergencyContact && (
                <div className="invalid-feedback">{errors.emergencyContact}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="height">
                Height (cm)
              </label>
              <input
                id="height"
                name="height"
                type="number"
                placeholder="e.g. 175"
                className={`form-control ${errors.height ? 'is-invalid' : ''}`}
                value={formData.height}
                onChange={handleChange}
              />
              {errors.height && <div className="invalid-feedback">{errors.height}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="weight">
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                placeholder="e.g. 70"
                className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                value={formData.weight}
                onChange={handleChange}
              />
              {errors.weight && <div className="invalid-feedback">{errors.weight}</div>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label required" htmlFor="address">
              Full Residential Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              placeholder="e.g. 123 Healthcare Ave, City, Country"
              className={`form-textarea ${errors.address ? 'is-invalid' : ''}`}
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={onCancel || (() => navigate('/patients'))}
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
          {isEdit ? 'Update Patient' : 'Save Patient'}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
