import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Receipt } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import patientService from '../../services/patientService';
import doctorService from '../../services/doctorService';
import billingService from '../../services/billingService';
import { useToast } from '../../context/ToastContext';

export const CreateBillModal = ({ isOpen, onClose, onBillCreated, preselectedPatientId = null }) => {
  const { success, error: showError } = useToast();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: preselectedPatientId || '',
    doctor: '',
    items: [
      {
        description: 'Doctor Consultation Fee',
        category: 'CONSULTATION',
        quantity: 1,
        unitPrice: 500,
      },
    ],
    tax: 0,
    discount: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [ptsRes, docRes] = await Promise.allSettled([
            patientService.getAllPatients({ limit: 50 }),
            doctorService.getAllDoctors(),
          ]);

          if (ptsRes.status === 'fulfilled') {
            const data = ptsRes.value?.data;
            setPatients(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
          }

          if (docRes.status === 'fulfilled') {
            const data = docRes.value?.data;
            setDoctors(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          showError('Failed to load patient or doctor lists');
        } finally {
          setLoadingData(false);
        }
      };

      fetchData();

      // Reset form
      setFormData({
        patient: preselectedPatientId || '',
        doctor: '',
        items: [
          {
            description: 'General Clinical Consultation',
            category: 'CONSULTATION',
            quantity: 1,
            unitPrice: 500,
          },
        ],
        tax: 0,
        discount: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [isOpen, preselectedPatientId]);

  // Handle doctor selection: auto-populate consultation fee if available
  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const doc = doctors.find((d) => d._id === docId);

    setFormData((prev) => {
      const newItems = [...prev.items];
      if (doc && doc.consultationFee && newItems.length > 0 && newItems[0].category === 'CONSULTATION') {
        newItems[0].unitPrice = doc.consultationFee;
        newItems[0].description = `Consultation with Dr. ${doc.name} (${doc.specialization})`;
      }
      return {
        ...prev,
        doctor: docId,
        items: newItems,
      };
    });
  };

  // Add line item
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          category: 'MEDICATION',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  // Update line item
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index][field] = value;
      return { ...prev, items: updated };
    });
  };

  // Calculations
  const subtotal = formData.items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const taxAmount = Number(formData.tax) || 0;
  const discountAmount = Number(formData.discount) || 0;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient) {
      showError('Please select a patient');
      return;
    }

    if (formData.items.some((it) => !it.description.trim() || Number(it.unitPrice) <= 0)) {
      showError('Please ensure all items have a description and valid price');
      return;
    }

    setSubmitting(true);
    try {
      const res = await billingService.createBill(formData);
      success('Medical invoice created successfully!');
      if (onBillCreated) {
        onBillCreated(res.data);
      }
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate New Medical Bill & Invoice"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
            Grand Total: ₹{grandTotal.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Receipt}
              onClick={handleSubmit}
              loading={submitting}
            >
              Create Invoice
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Patient & Doctor Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label required">Select Patient</label>
            <select
              className="form-select"
              required
              value={formData.patient}
              onChange={(e) => setFormData((prev) => ({ ...prev, patient: e.target.value }))}
              disabled={!!preselectedPatientId}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Consulting Doctor (Optional)</label>
            <select
              className="form-select"
              value={formData.doctor}
              onChange={handleDoctorChange}
            >
              <option value="">-- Assign Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name} ({d.specialization}) - ₹{d.consultationFee}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Line Items Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="form-label required" style={{ margin: 0 }}>
              Clinical Items & Services
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddItem}
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            >
              <Plus size={13} />
              <span>Add Item</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {formData.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.3fr 0.8fr 1.2fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'var(--color-slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <input
                    type="text"
                    placeholder="Description (e.g. Blood Test, Paracetamol)"
                    className="form-control"
                    required
                    style={{ fontSize: '0.825rem' }}
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.825rem' }}
                    value={item.category}
                    onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                  >
                    <option value="CONSULTATION">Consultation</option>
                    <option value="MEDICATION">Medication / Pharmacy</option>
                    <option value="LAB_TEST">Lab Test</option>
                    <option value="PROCEDURE">Procedure / Surgery</option>
                    <option value="ROOM_CHARGE">Room / Bed Charge</option>
                    <option value="OTHER">Other Services</option>
                  </select>
                </div>

                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className="form-control"
                    style={{ fontSize: '0.825rem', textAlign: 'center' }}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Unit Price (₹)"
                    className="form-control"
                    required
                    style={{ fontSize: '0.825rem', textAlign: 'right' }}
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="button"
                    className="btn-icon btn-danger-outline btn-sm"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={formData.items.length <= 1}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taxes, Discount, and Due Date */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Taxes / GST (₹)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={formData.tax}
              onChange={(e) => setFormData((prev) => ({ ...prev, tax: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount (₹)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={formData.discount}
              onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Payment Due Date</label>
            <input
              type="date"
              className="form-control"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Billing Notes (Optional)</label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="Additional billing remarks or insurance notes..."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateBillModal;
