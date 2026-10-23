import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PatientForm from '../components/patients/PatientForm';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import patientService from '../services/patientService';
import { useToast } from '../context/ToastContext';

export const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const res = await patientService.getPatientById(id);
        if (res?.data) {
          setPatient(res.data);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load patient details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleSubmit = async (updatedData) => {
    setSaveLoading(true);
    try {
      await patientService.updatePatient(id, updatedData);
      success('Patient information updated successfully!');
      navigate(`/patients/${id}`);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner size={36} primary />
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
          Loading patient record...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div>
        <Alert type="danger" message={errorMsg} />
        <Link to="/patients" className="btn btn-secondary">
          Back to Patients List
        </Link>
      </div>
    );
  }

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
            <Link to={`/patients/${id}`}>
              {patient?.firstName} {patient?.lastName}
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-slate-800)' }}>Edit</span>
          </div>
          <h1 className="page-title">
            Edit Patient: {patient?.firstName} {patient?.lastName}
          </h1>
          <p className="page-subtitle">Update patient clinical information and contact details</p>
        </div>
      </div>

      <PatientForm
        initialData={patient}
        onSubmit={handleSubmit}
        loading={saveLoading}
        isEdit={true}
      />
    </div>
  );
};

export default EditPatient;
