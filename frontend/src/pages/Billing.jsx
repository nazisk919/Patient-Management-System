import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  QrCode,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PaymentModal from '../components/billing/PaymentModal';
import CreateBillModal from '../components/billing/CreateBillModal';
import billingService from '../services/billingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatDate';
import { ROLES } from '../utils/constants';

export const Billing = () => {
  const { user, hasRole } = useAuth();
  const { success, error: showError } = useToast();

  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'PAID'
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);
  const [selectedBillForView, setSelectedBillForView] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canManage = hasRole(ROLES.ADMIN, ROLES.STAFF, ROLES.DOCTOR);
  const canDelete = hasRole(ROLES.ADMIN);

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const [billsRes, statsRes] = await Promise.allSettled([
        billingService.getAllBills(params),
        billingService.getBillingStats(),
      ]);

      if (billsRes.status === 'fulfilled') {
        setBills(billsRes.value.data || []);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleDelete = async () => {
    if (!billToDelete) return;
    setDeleteLoading(true);
    try {
      await billingService.deleteBill(billToDelete._id);
      success('Bill record deleted successfully');
      setBillToDelete(null);
      fetchBillingData();
    } catch (err) {
      showError(err.message || 'Failed to delete bill');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    fetchBillingData();
  };

  const handleOpenDemoPayment = () => {
    const fullName = user?.name || 'Nazis Khan';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Nazis';
    const lastName = nameParts.slice(1).join(' ') || 'Khan';

    setSelectedBillForPay({
      _id: 'demo_bill_101',
      invoiceNumber: 'INV-2026-0042',
      patient: {
        firstName,
        lastName,
        phone: user?.phone || '+91 98765 43210',
      },
      doctor: {
        name: 'Dr. Gregory House',
      },
      items: [
        { description: 'General Consultation & Health Checkup', category: 'CONSULTATION', quantity: 1, unitPrice: 750, total: 750 },
        { description: 'CBC Blood Test & Diagnostic Panel', category: 'LABORATORY', quantity: 1, unitPrice: 450, total: 450 },
      ],
      subtotal: 1200,
      tax: 0,
      discount: 0,
      totalAmount: 1200,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
    });
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Invoices' },
    { key: 'PENDING', label: 'Pending Payment' },
    { key: 'PAID', label: 'Paid Invoices' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Online Payments</h1>
          <p className="page-subtitle">
            Manage clinical invoices, process UPI & card payments on phone, and generate official receipts
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchBillingData}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenDemoPayment}
            title="Preview UPI QR Payment Modal"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderColor: 'var(--color-teal)' }}
          >
            <QrCode size={16} color="var(--color-teal)" />
            <span>Test UPI Payment</span>
          </button>
          {canManage && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
            >
              Generate Invoice
            </Button>
          )}
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* KPI Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Revenue Collected"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          accentColor="#10b981"
          bgColor="#ecfdf5"
          subtitle="Settled patient payments"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${(stats?.pendingAmount || 0).toLocaleString()}`}
          icon={Clock}
          accentColor="#f59e0b"
          bgColor="#fffbeb"
          subtitle={`${stats?.pendingCount || 0} unpaid clinical bills`}
        />
        <StatCard
          title="Paid Invoices"
          value={stats?.paidCount ?? 0}
          icon={CheckCircle}
          accentColor="#0284c7"
          bgColor="#e0f2fe"
          subtitle="Successfully cleared invoices"
        />
        <StatCard
          title="Total Invoices Issued"
          value={stats?.totalInvoices ?? bills.length}
          icon={Receipt}
          accentColor="#8b5cf6"
          bgColor="#f5f3ff"
          subtitle="All recorded clinical billing"
        />
      </div>

      {/* Filter Tabs and Search Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            padding: '0 1rem',
          }}
        >
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className="btn btn-ghost"
                style={{
                  borderRadius: 0,
                  borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.85rem 1rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchBillingData();
            }}
            style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px' }}
          >
            <input
              type="text"
              placeholder="Search by Invoice #, Patient name or phone..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              <Search size={16} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <Spinner size={32} primary />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
              Loading billing & payment records...
            </p>
          </div>
        ) : bills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <EmptyState
              icon={Receipt}
              title="No billing records found"
              description="Database mein abhi koi invoice nahi hai. Patient bills hospital doctor ya staff dwara create kiye jaate hain."
            />
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenDemoPayment}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
              >
                <QrCode size={18} />
                <span>Test UPI Payment System (Open QR Code)</span>
              </button>
              {canManage && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCreateModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} />
                  <span>Generate Invoice</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Date & Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => {
                  const isPaid = b.status === 'PAID';
                  return (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>
                          #{b.invoiceNumber}
                        </span>
                        {b.transactionId && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Txn: {b.transactionId}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                          {b.patient?.firstName ? `${b.patient.firstName} ${b.patient.lastName}` : 'Patient'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {b.patient?.phone || 'No phone'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {b.items?.[0]?.description || 'Clinical Service'}
                          {b.items?.length > 1 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '4px' }}>
                              (+{b.items.length - 1} more)
                            </span>
                          )}
                        </div>
                        {b.doctor && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)' }}>
                            Dr. {b.doctor.name}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-slate-900)' }}>
                          ₹{b.totalAmount?.toLocaleString()}
                        </div>
                        {b.paymentMethod && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            via {b.paymentMethod.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.825rem' }}>{formatDate(b.createdAt)}</div>
                        {!isPaid && b.dueDate && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-warning)' }}>
                            Due: {formatDate(b.dueDate)}
                          </div>
                        )}
                      </td>

                      <td>
                        <Badge variant={isPaid ? 'success' : 'warning'}>
                          {isPaid ? 'PAID' : 'PENDING'}
                        </Badge>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                          {/* Pay Online Button for Unpaid Bills */}
                          {!isPaid && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                              onClick={() => setSelectedBillForPay(b)}
                              title="Pay on Phone via UPI or Card"
                            >
                              <QrCode size={14} />
                              <span>Pay Online</span>
                            </button>
                          )}

                          {/* View Details / Receipt Button */}
                          <button
                            type="button"
                            className="btn-icon btn-secondary btn-sm"
                            onClick={() => setSelectedBillForView(b)}
                            title="View Invoice & Receipt"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Admin Delete */}
                          {canDelete && (
                            <button
                              type="button"
                              className="btn-icon btn-danger-outline btn-sm"
                              onClick={() => setBillToDelete(b)}
                              title="Delete Invoice"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Online Payment Modal */}
      {selectedBillForPay && (
        <PaymentModal
          isOpen={!!selectedBillForPay}
          onClose={() => setSelectedBillForPay(null)}
          bill={selectedBillForPay}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Create New Bill Modal */}
      <CreateBillModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onBillCreated={() => fetchBillingData()}
      />

      {/* View Bill / Receipt Modal */}
      <Modal
        isOpen={!!selectedBillForView}
        onClose={() => setSelectedBillForView(null)}
        title={`Invoice Receipt #${selectedBillForView?.invoiceNumber}`}
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {!selectedBillForView?.status?.includes('PAID') ? (
              <Button
                variant="primary"
                icon={QrCode}
                onClick={() => {
                  const bill = selectedBillForView;
                  setSelectedBillForView(null);
                  setSelectedBillForPay(bill);
                }}
              >
                Proceed to Pay
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => window.print()}>
                Print Receipt
              </Button>
            )}
            <Button variant="secondary" onClick={() => setSelectedBillForView(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedBillForView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PATIENT</span>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {selectedBillForView.patient?.firstName} {selectedBillForView.patient?.lastName}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Phone: {selectedBillForView.patient?.phone}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS</span>
                <div>
                  <Badge variant={selectedBillForView.status === 'PAID' ? 'success' : 'warning'}>
                    {selectedBillForView.status}
                  </Badge>
                </div>
                {selectedBillForView.paidAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Paid on {formatDate(selectedBillForView.paidAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Services Breakdown
              </span>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selectedBillForView.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.5rem',
                      backgroundColor: 'var(--color-slate-50)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span>
                      {it.description} <strong style={{ color: 'var(--text-muted)' }}>×{it.quantity}</strong>
                    </span>
                    <span style={{ fontWeight: 600 }}>₹{it.total?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>₹{selectedBillForView.subtotal?.toLocaleString()}</span>
              </div>
              {selectedBillForView.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Taxes:</span>
                  <span>+₹{selectedBillForView.tax?.toLocaleString()}</span>
                </div>
              )}
              {selectedBillForView.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount:</span>
                  <span>-₹{selectedBillForView.discount?.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '2px solid var(--border-color)', paddingTop: '0.4rem' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{selectedBillForView.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!billToDelete}
        onClose={() => setBillToDelete(null)}
        title="Confirm Invoice Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBillToDelete(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Delete Invoice
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)' }}>
          Are you sure you want to delete invoice{' '}
          <strong>#{billToDelete?.invoiceNumber}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Billing;
