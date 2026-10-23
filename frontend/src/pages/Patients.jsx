import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import PatientTable from '../components/patients/PatientTable';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES, BLOOD_GROUPS } from '../utils/constants';

export const Patients = () => {
  const { hasRole } = useAuth();
  const { success, error } = useToast();

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const canCreate = hasRole(ROLES.ADMIN, ROLES.STAFF);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        page,
        limit: 10,
        sort: sortBy,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (bloodFilter) {
        params.bloodGroup = bloodFilter;
      }

      const res = await patientService.getAllPatients(params);
      const resData = res?.data;

      if (resData && Array.isArray(resData.data)) {
        setPatients(resData.data);
        setPagination({
          currentPage: resData.currentPage || page,
          totalPages: resData.totalPages || 1,
          totalRecords: resData.totalRecords || resData.data.length,
          limit: resData.limit || 10,
        });
      } else if (Array.isArray(resData)) {
        setPatients(resData);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalRecords: resData.length,
          limit: resData.length,
        });
      } else {
        setPatients([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load patients list.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, bloodFilter, sortBy]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  const handleDeletePatient = async (id) => {
    setDeleteLoading(true);
    try {
      await patientService.deletePatient(id);
      success('Patient removed successfully.');
      fetchPatients();
    } catch (err) {
      error(err.message || 'Failed to delete patient record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Records</h1>
          <p className="page-subtitle">
            Manage patient demographics, contact records, and clinical histories
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchPatients}
            title="Refresh list"
            disabled={loading}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <Link to="/patients/add" className="btn btn-primary">
              <Plus size={16} />
              <span>Add Patient</span>
            </Link>
          )}
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flex: '1', minWidth: '240px', gap: '0.5rem' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search by patient name or phone..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary">
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={bloodFilter}
                onChange={(e) => {
                  setBloodFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    Blood: {bg}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '160px' }}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="firstName">Name (A-Z)</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Patients Data Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <Spinner size={32} primary />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
              Loading patient directory...
            </p>
          </div>
        ) : (
          <PatientTable
            patients={patients}
            pagination={pagination}
            onPageChange={(newPage) => setPage(newPage)}
            onDelete={handleDeletePatient}
            deleteLoading={deleteLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Patients;
