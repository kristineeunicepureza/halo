import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Calendar, User, BookOpen, Clock, Trash2, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: number; studentName: string; tutorName: string;
  subject: string; notes: string; status: string;
  scheduledTime: string; createdAt: string;
  cancellationReason?: string; rejectionReason?: string;
}

const statusStyle: Record<string, React.CSSProperties> = {
  PENDING:   { background: '#FFFBEB', color: '#D97706' },
  CONFIRMED: { background: '#EFF6FF', color: '#2563EB' },
  COMPLETED: { background: '#ECFDF5', color: '#059669' },
  CANCELLED: { background: '#FEF2F2', color: '#DC2626' },
  REJECTED:  { background: '#FEF2F2', color: '#DC2626' },
};
const accentLine: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', COMPLETED: '#10B981',
  CANCELLED: '#DC2626', REJECTED: '#DC2626',
};

export function MyBookings() {
  const { currentUser } = useApp();
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [cancelModal,  setCancelModal]  = useState<{ id: number } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling,   setCancelling]   = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get<Booking[]>('/api/bookings/my-bookings');
      setBookings(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancelSubmit = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await api.patch(`/api/bookings/${cancelModal.id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled.');
      setBookings(prev => prev.map(b =>
        b.id === cancelModal.id ? { ...b, status: 'CANCELLED', cancellationReason: cancelReason } : b
      ));
      setCancelModal(null);
      setCancelReason('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (!currentUser) return null;

  return (
    <DashboardLayout role="STUDENT">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>My Bookings</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Your tutoring session history and upcoming bookings.</p>
        </div>
        <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,47,108,0.07)' }}>
          <Calendar size={56} style={{ color: '#BFDBFE', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>No Bookings Yet</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Browse tutors and book your first session to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {bookings.map(b => (
            <div key={b.id} style={{ background: 'white', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 4px 16px rgba(0,47,108,0.06)', border: '1px solid rgba(59,130,246,0.08)', borderLeft: `4px solid ${accentLine[b.status] || '#e0eaff'}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px' }}>{b.tutorName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Tutor</div>
                  </div>
                  <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, ...statusStyle[b.status] }}>
                    {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                    <BookOpen size={14} color="#93C5FD" />
                    <span><strong style={{ color: '#1e3a6e' }}>Subject:</strong> {b.subject}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                    <Calendar size={14} color="#93C5FD" />
                    <span><strong style={{ color: '#1e3a6e' }}>Date:</strong> {new Date(b.scheduledTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                    <Clock size={14} color="#93C5FD" />
                    <span><strong style={{ color: '#1e3a6e' }}>Time:</strong> {new Date(b.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {b.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', color: '#5a7bad', fontSize: '13px' }}>
                      <span style={{ flexShrink: 0 }}>📝</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.notes}</span>
                    </div>
                  )}
                </div>

                {/* Reason badges */}
                {(b.cancellationReason || b.rejectionReason) && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={13} color="#DC2626" />
                    <span style={{ color: '#991B1B', fontSize: '12px', fontWeight: 600 }}>
                      {b.cancellationReason ? `Cancelled: ${b.cancellationReason}` : `Rejected: ${b.rejectionReason}`}
                    </span>
                  </div>
                )}
              </div>

              {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                <button
                  onClick={() => { setCancelModal({ id: b.id }); setCancelReason(''); }}
                  style={{ padding: '8px', borderRadius: '9px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                  title="Cancel booking"
                  onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,10,35,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setCancelModal(null)}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 28px 60px rgba(0,47,108,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '17px', marginBottom: '2px' }}>Cancel Booking</h3>
                <p style={{ color: '#5a7bad', fontSize: '13px' }}>The tutor will be notified of the cancellation.</p>
              </div>
            </div>
            <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '7px' }}>
              Reason for cancellation (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g., Schedule conflict, no longer needed…"
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '18px' }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setCancelModal(null)} style={{ flex: 1, padding: '11px', borderRadius: '11px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Keep Booking
              </button>
              <button onClick={handleCancelSubmit} disabled={cancelling}
                style={{ flex: 1, padding: '11px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#B91C1C)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {cancelling ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={15} />}
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}