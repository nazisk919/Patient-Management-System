import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Lock,
  Printer,
  ExternalLink,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import billingService from '../../services/billingService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatDate';

export const PaymentModal = ({ isOpen, onClose, bill, onPaymentSuccess }) => {
  const { success, error: showError } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('UPI_ONLINE'); // 'UPI_ONLINE', 'CARD_ONLINE', 'NET_BANKING', 'CASH'
  const [step, setStep] = useState('SELECT'); // 'SELECT', 'PROCESSING', 'SUCCESS'
  const [loading, setLoading] = useState(false);
  const [paidBill, setPaidBill] = useState(null);

  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [countdown, setCountdown] = useState(599); // 10 minutes in seconds

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setLoading(false);
      setPaidBill(null);
      setCountdown(599);
    }
  }, [isOpen]);

  // Countdown timer for UPI QR Code
  useEffect(() => {
    let timer;
    if (isOpen && step === 'SELECT' && paymentMethod === 'UPI_ONLINE' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, step, paymentMethod, countdown]);

  if (!bill) return null;

  const totalAmount = bill.totalAmount || 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const formatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    return cleaned;
  };

  const handleProcessPayment = async () => {
    // Basic validation
    if (paymentMethod === 'UPI_ONLINE' && upiId && !upiId.includes('@')) {
      showError('Please enter a valid UPI ID (e.g., name@okhdfcbank)');
      return;
    }
    if (paymentMethod === 'CARD_ONLINE') {
      const cleanNum = cardData.number.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        showError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        showError('Please enter card expiry date (MM/YY)');
        return;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        showError('Please enter card CVV');
        return;
      }
    }

    setStep('PROCESSING');
    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        paymentMethod,
        upiId: paymentMethod === 'UPI_ONLINE' ? upiId || 'patient@upi' : undefined,
        cardLast4:
          paymentMethod === 'CARD_ONLINE'
            ? cardData.number.replace(/\s/g, '').slice(-4)
            : undefined,
        cardHolder: paymentMethod === 'CARD_ONLINE' ? cardData.name || 'Cardholder' : undefined,
        bankName: paymentMethod === 'NET_BANKING' ? selectedBank : undefined,
      };

      // Simulated gateway delay for realistic banking transaction
      await new Promise((resolve) => setTimeout(resolve, 1400));

      let updatedBill;
      if (bill._id?.startsWith('demo')) {
        updatedBill = {
          ...bill,
          status: 'PAID',
          paymentMethod,
          paidAt: new Date().toISOString(),
          transactionId: `UPI${Date.now().toString().slice(-8)}`,
        };
      } else {
        const res = await billingService.payBill(bill._id, payload);
        updatedBill = res.data;
      }

      setPaidBill(updatedBill);
      setStep('SUCCESS');
      success(`Payment of ₹${totalAmount.toLocaleString()} completed successfully!`);

      if (onPaymentSuccess) {
        onPaymentSuccess(updatedBill);
      }
    } catch (err) {
      setStep('SELECT');
      showError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const upiDeepLink = `upi://pay?pa=carepulse.hospital@icici&pn=CarePulse%20Hospital&am=${totalAmount}&tr=${bill.invoiceNumber}&cu=INR`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'SUCCESS' ? 'Payment Receipt & Confirmation' : 'Pay Medical Bill Online'}
      size={step === 'SUCCESS' ? 'lg' : 'md'}
    >
      {/* STEP 1: PAYMENT METHOD SELECTION & INPUTS */}
      {step === 'SELECT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Bill Summary Banner */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-slate-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                INVOICE: #{bill.invoiceNumber}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-slate-900)', marginTop: '2px' }}>
                {bill.patient?.firstName} {bill.patient?.lastName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {bill.items?.length || 1} clinical billing items
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Amount to Pay
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                ₹{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Choose Payment Method
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
              }}
            >
              {[
                { id: 'UPI_ONLINE', label: 'UPI / QR', icon: QrCode, badge: 'Popular' },
                { id: 'CARD_ONLINE', label: 'Cards', icon: CreditCard, badge: null },
                { id: 'NET_BANKING', label: 'NetBanking', icon: Building, badge: null },
                { id: 'CASH', label: 'Cash Desk', icon: Banknote, badge: null },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'white',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {m.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '6px',
                          backgroundColor: 'var(--color-teal)',
                          color: 'white',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {m.badge}
                      </span>
                    )}
                    <Icon size={20} color={isSelected ? 'var(--color-primary)' : 'var(--color-slate-600)'} />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-slate-700)',
                      }}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* METHOD 1: UPI / SCAN ON PHONE */}
          {paymentMethod === 'UPI_ONLINE' && (
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-teal)', fontWeight: 600, fontSize: '0.85rem' }}>
                <Smartphone size={16} />
                <span>Scan and Pay on Phone</span>
              </div>

              {/* Realistic Medical UPI QR Code */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  border: '2px dashed var(--color-primary)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <svg width="170" height="170" viewBox="0 0 100 100" fill="none">
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="white" />
                  {/* Top-Left Finder */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#0284c7" />
                  {/* Top-Right Finder */}
                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="#0284c7" />
                  {/* Bottom-Left Finder */}
                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="#0284c7" />
                  {/* Simulated QR Code Data Grid */}
                  <rect x="36" y="8" width="6" height="6" fill="#334155" />
                  <rect x="46" y="8" width="6" height="6" fill="#334155" />
                  <rect x="56" y="8" width="6" height="6" fill="#334155" />
                  <rect x="36" y="20" width="16" height="6" fill="#0284c7" />
                  <rect x="56" y="20" width="8" height="6" fill="#334155" />
                  <rect x="10" y="36" width="6" height="12" fill="#334155" />
                  <rect x="22" y="36" width="8" height="6" fill="#0284c7" />
                  <rect x="70" y="36" width="14" height="6" fill="#334155" />
                  <rect x="36" y="42" width="28" height="16" rx="4" fill="#f0fdf4" stroke="#10b981" strokeWidth="1" />
                  <text x="50" y="53" fontSize="7" fontWeight="bold" fill="#047857" textAnchor="middle">
                    CAREPULSE
                  </text>
                  <rect x="10" y="54" width="18" height="6" fill="#334155" />
                  <rect x="72" y="48" width="8" height="14" fill="#0284c7" />
                  <rect x="84" y="54" width="8" height="8" fill="#334155" />
                  <rect x="36" y="64" width="10" height="8" fill="#334155" />
                  <rect x="50" y="64" width="14" height="6" fill="#0284c7" />
                  <rect x="70" y="70" width="8" height="8" fill="#334155" />
                  <rect x="82" y="70" width="10" height="12" fill="#0284c7" />
                  <rect x="38" y="78" width="16" height="14" fill="#334155" />
                  <rect x="58" y="82" width="8" height="10" fill="#334155" />
                  <rect x="70" y="86" width="20" height="6" fill="#0284c7" />
                </svg>

                <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                  Accepted by GPay, PhonePe, Paytm, BHIM
                </div>
              </div>

              {/* Timer indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Clock size={14} color="var(--color-warning)" />
                <span>QR Code valid for: <strong>{formattedCountdown}</strong></span>
              </div>

              {/* Direct UPI ID entry or UPI link */}
              <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Or enter your UPI ID:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="example@okaxis / phone@upi"
                    className="form-control"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    onClick={handleProcessPayment}
                    loading={loading}
                    style={{ flexShrink: 0 }}
                  >
                    Pay ₹{totalAmount.toLocaleString()}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: DEBIT / CREDIT CARD */}
          {paymentMethod === 'CARD_ONLINE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label required">Card Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="4532 8900 1234 5678"
                    className="form-control"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData((prev) => ({
                        ...prev,
                        number: formatCardNumber(e.target.value),
                      }))
                    }
                  />
                  <CreditCard
                    size={18}
                    style={{ position: 'absolute', right: '12px', top: '11px', color: 'var(--color-slate-400)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Full name as printed on card"
                  className="form-control"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label required">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="form-control"
                    value={cardData.expiry}
                    onChange={(e) =>
                      setCardData((prev) => ({
                        ...prev,
                        expiry: formatExpiry(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">CVV / CVC</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      className="form-control"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                    />
                    <Lock
                      size={15}
                      style={{ position: 'absolute', right: '12px', top: '11px', color: 'var(--color-slate-400)' }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                <ShieldCheck size={16} color="var(--color-teal)" />
                <span>256-Bit Encrypted & RBI / NPCI Verified Gateway</span>
              </div>
            </div>
          )}

          {/* METHOD 3: NET BANKING */}
          {paymentMethod === 'NET_BANKING' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className="form-label">Select Your Bank</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                {[
                  'HDFC Bank',
                  'State Bank of India',
                  'ICICI Bank',
                  'Axis Bank',
                  'Kotak Mahindra Bank',
                  'Punjab National Bank',
                ].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border:
                        selectedBank === bank
                          ? '2px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                      backgroundColor: selectedBank === bank ? 'var(--color-primary-light)' : 'white',
                      fontWeight: selectedBank === bank ? 700 : 500,
                      fontSize: '0.85rem',
                      color: selectedBank === bank ? 'var(--color-primary-dark)' : 'var(--color-slate-800)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* METHOD 4: CASH DESK */}
          {paymentMethod === 'CASH' && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-slate-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-color)',
                textAlign: 'center',
              }}
            >
              <Banknote size={36} color="var(--color-teal)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-slate-900)' }}>
                Cash Settlement at Reception
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Record instant cash collection of ₹{totalAmount.toLocaleString()} at the clinic/hospital billing counter.
              </p>
            </div>
          )}

          {/* Bottom Action Footer for Card / Netbanking / Cash */}
          {paymentMethod !== 'UPI_ONLINE' && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessPayment}
                loading={loading}
                icon={Lock}
              >
                Confirm & Pay ₹{totalAmount.toLocaleString()}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PROCESSING ANIMATION */}
      {step === 'PROCESSING' && (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Spinner size={42} primary />
          <h3 style={{ marginTop: '1.25rem', fontSize: '1.15rem', fontWeight: 700 }}>
            Processing Secure Payment...
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Please do not refresh or close this window. Verifying with payment gateway.
          </p>
        </div>
      )}

      {/* STEP 3: OFFICIAL HOSPITAL RECEIPT SCREEN */}
      {step === 'SUCCESS' && paidBill && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Success Banner */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#065f46' }}>
                Payment Successfully Received!
              </div>
              <div style={{ fontSize: '0.825rem', color: '#047857', marginTop: '2px' }}>
                Transaction ID: <strong>{paidBill.transactionId}</strong>
              </div>
            </div>
          </div>

          {/* Printable Official Medical Invoice Receipt */}
          <div
            id="printable-receipt"
            style={{
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'white',
            }}
          >
            {/* Receipt Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid var(--color-slate-100)',
                paddingBottom: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  CarePulse Healthcare Clinic
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  24/7 Clinical Excellence • Official E-Receipt
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    letterSpacing: '0.05em',
                  }}
                >
                  PAID
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {formatDate(paidBill.paidAt || new Date())}
                </div>
              </div>
            </div>

            {/* Receipt Metadata */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Patient Name
                </span>
                <div style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  {paidBill.patient?.firstName} {paidBill.patient?.lastName}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Phone: {paidBill.patient?.phone || 'N/A'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Invoice Details
                </span>
                <div style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  #{paidBill.invoiceNumber}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Method: {paidBill.paymentMethod?.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="table" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {paidBill.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{it.description}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        Category: {it.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{it.unitPrice?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{it.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Breakdown */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem',
                maxWidth: '240px',
                marginLeft: 'auto',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>₹{paidBill.subtotal?.toLocaleString()}</span>
              </div>
              {paidBill.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount:</span>
                  <span>-₹{paidBill.discount?.toLocaleString()}</span>
                </div>
              )}
              {paidBill.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Taxes:</span>
                  <span>+₹{paidBill.tax?.toLocaleString()}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  borderTop: '2px solid var(--color-slate-900)',
                  paddingTop: '0.4rem',
                  marginTop: '0.2rem',
                }}
              >
                <span>Total Paid:</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{paidBill.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
            <Button variant="secondary" icon={Printer} onClick={handlePrintReceipt}>
              Print / Save Receipt
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
