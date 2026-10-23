import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PatientForm from '../components/patients/PatientForm';
import patientService from '../services/patientService';
import { useToast } from '../context/ToastContext';

export const AddPatient = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (patientData) => {
    setLoading(true);
    try {
      const res = await patientService.createPatient(patientData);
      success('Patient registered successfully!');
      const newId = res?.data?._id;
      if (newId) {
        navigate(`/patients/${newId}`);
      } else {
        navigate('/patients');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}
          >
            <Link to="/patients">Patients</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-slate-800)' }}>Register New</span>
          </div>
          <h1 className="page-title">Register New Patient</h1>
          <p className="page-subtitle">
            Enter patient demographic, physical, and emergency contact details
          </p>
        </div>
      </div>

      <PatientForm onSubmit={handleSubmit} loading={loading} isEdit={false} />
    </div>
  );
};

export default AddPatient;
