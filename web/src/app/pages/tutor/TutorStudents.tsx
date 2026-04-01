import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import {
  GraduationCap, Calendar, Search, RefreshCw,
  Clock, CheckCircle2, XCircle, Star, Check, X, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingRow {
  id: number;
  studentName: string;
  subject: string;
  notes: string;
  status: string;
  scheduledTime: string;
  cancellationReason?: string;
  rejectionReason?: string;
}

const statusColor: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  PENDING:            { bg: '#FFFBEB', text: '#D97706', icon: Clock       },
  CONFIRMED:          { bg: '#EFF6FF', text: '#2563EB', icon: CheckCircle2 },
  COMPLETED:          { bg: '#ECFDF5', text: '#059669', icon: CheckCircle2 },
  NO_SHOW_STUDENT:    { bg: '#FEF2F2', text: '#DC2626', icon: XCircle      },
  NO_SHOW_TUTOR:      { bg: '#FEF2F2', text: '#DC2626', icon: XCircle      },
  CANCELLED:          { bg: '#FEF2F2', text: '#DC2626', icon: XCircle      },
  REJECTED:           { bg: '#FEF2F2', text: '#DC2626', icon: XCircle      },
};

export function TutorStudents() {
  const { currentUser } = useApp();
  const [bookings,  setBookings]  = useState<BookingRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [acting,    setActing]    = useState<number | null>(null);

  // Reject modal state
  const [rejectModal, setRejectModal]   = useState<{ id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get<BookingRow[]>('/api/bookings/tutor-bookings');
      setBookings(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleConfirm = async (id: number) => {
    setActing(id);
    try {
      await api.patch(`/api/bookings/${id}/confirm`);
      toast.success('Booking confirmed!');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CONFIRMED' } : b));
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm');
    } finally {
      setActing(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    setActing(rejectModal.id);
    try {
      await api.patch(`/api/bookings/${rejectModal.id}/reject`, { reason: rejectReason });
      toast.success('Booking rejected.');
      setBookings(prev => prev.map(b =>
        b.id === rejectModal.id ? { ...b, status: 'REJECTED', rejectionReason: rejectReason } : b
      ));
      setRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActing(null);
    }
  };

  const handleComplete = async (id: number) => {
    setActing(id);
    try {
      await api.patch(`/api/bookings/${id}/complete`);
      toast.success('Session marked as completed!');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'COMPLETED' } : b));
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as completed');
    } finally {
      setActing(null);
    }
  };

  const handleStudentNoShow = async (id: number) => {
    setActing(id);
    try {
      await api.patch(`/api/bookings/${id}/no-show-student`);
      toast.success('Session marked as student no-show!');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'NO_SHOW_STUDENT' } : b));
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark no-show');
    } finally {
      setActing(null);
    }
  };

  const handleTutorNoShow = async (id: number) => {
    setActing(id);
    try {
      await api.patch(`/api/bookings/${id}/no-show-tutor`);
      toast.success('Session marked as tutor no-show!');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'NO_SHOW_TUTOR' } : b));
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark no-show');
    } finally {
      setActing(null);
    }
  };

  if (!currentUser) return null;

  const filtered = bookings.filter(b =>
    `${b.studentName} ${b.subject}`.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming  = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
  const pending   = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <DashboardLayout role="TUTOR">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          My Students
        </h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>Review and manage student booking requests.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Bookings',  value: bookings.length,  color: '#3B82F6', bg: '#EFF6FF',  icon: Calendar       },
          { label: 'Pending Review',  value: pending,          color: '#F59E0B', bg: '#FFFBEB',  icon: Clock          },
          { label: 'Upcoming',        value: upcoming,          color: '#10B981', bg: '#ECFDF5',  icon: CheckCircle2   },
          { label: 'Unique Students', value: new Set(bookings.map(b => b.studentName)).size, color: '#8B5CF6', bg: '#F3F0FF', icon: GraduationCap },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 16px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', lineHeight: 1 }}>{value}</div>
              <div style={{ color: '#6B8FC4', fontSize: '12px', marginTop: '3px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1px solid #FCD34D', marginBottom: '18px' }}>
          <Clock size={16} color="#D97706" />
          <span style={{ color: '#92400E', fontWeight: 600, fontSize: '13.5px' }}>
            You have <strong>{pending}</strong> pending booking{pending > 1 ? 's' : ''} waiting for your response.
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0eaff', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={15} color="#93C5FD" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or subject…"
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', color: '#001a4d', boxSizing: 'border-box' as const }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'}
            />
          </div>
          <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7faff' }}>
                {['Student','Subject','Scheduled','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: '#5a7bad', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.7px', borderBottom: '1px solid #e0eaff', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <GraduationCap size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} /><br />No student bookings yet.
                </td></tr>
              ) : filtered.map((b, i) => {
                const st = statusColor[b.status] || statusColor.PENDING;
                const Icon = st.icon;
                const isPending = b.status === 'PENDING';
                const isActing  = acting === b.id;
                return (
                  <tr key={b.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f0f4fa' : 'none', background: isPending ? 'rgba(251,191,36,0.03)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = isPending ? 'rgba(251,191,36,0.06)' : '#f7faff')}
                    onMouseLeave={e => (e.currentTarget.style.background = isPending ? 'rgba(251,191,36,0.03)' : 'transparent')}
                  >
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{b.studentName[0]}</span>
                        </div>
                        <span style={{ color: '#001a4d', fontWeight: 600, fontSize: '13.5px' }}>{b.studentName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px', color: '#5a7bad', fontSize: '13px' }}>{b.subject}</td>
                    <td style={{ padding: '13px 18px', color: '#5a7bad', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                      {new Date(b.scheduledTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 11px', borderRadius: '20px', background: st.bg, color: st.text, fontSize: '12px', fontWeight: 700 }}>
                        <Icon size={12} /> {b.status.charAt(0)+b.status.slice(1).toLowerCase()}
                      </span>
                      {b.cancellationReason && (
                        <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>Reason: {b.cancellationReason}</div>
                      )}
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* Accept */}
                          <button
                            onClick={() => handleConfirm(b.id)}
                            disabled={isActing}
                            title="Accept booking"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontWeight: 700, fontSize: '12.5px', cursor: isActing ? 'not-allowed' : 'pointer', boxShadow: '0 3px 8px rgba(5,150,105,0.3)', transition: 'all 0.15s', opacity: isActing ? 0.7 : 1 }}
                            onMouseEnter={e => { if (!isActing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {isActing ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} />}
                            Accept
                          </button>
                          {/* Reject */}
                          <button
                            onClick={() => { setRejectModal({ id: b.id }); setRejectReason(''); }}
                            disabled={isActing}
                            title="Reject booking"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '9px', border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '12.5px', cursor: isActing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: isActing ? 0.7 : 1 }}
                            onMouseEnter={e => { if (!isActing) e.currentTarget.style.background = '#FECACA'; }}
                            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : b.status === 'CONFIRMED' ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Complete */}
                          <button
                            onClick={() => handleComplete(b.id)}
                            disabled={isActing}
                            title="Mark session as completed"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#ECFDF5', color: '#059669', fontWeight: 600, fontSize: '11.5px', cursor: isActing ? 'not-allowed' : 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.2)', transition: 'all 0.15s', opacity: isActing ? 0.5 : 1 }}
                            onMouseEnter={e => { if (!isActing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {isActing === b.id ? <Loader2 size={10} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={10} />}
                            Complete
                          </button>
                          {/* Student No-Show */}
                          <button
                            onClick={() => handleStudentNoShow(b.id)}
                            disabled={isActing}
                            title="Mark student as no-show"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '11.5px', cursor: isActing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: isActing ? 0.5 : 1 }}
                            onMouseEnter={e => { if (!isActing) e.currentTarget.style.background = '#FECACA'; }}
                            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                          >
                            {isActing === b.id ? <Loader2 size={10} style={{ animation: 'spin 0.8s linear infinite' }} /> : <>✕</>}
                            Student No-Show
                          </button>
                          {/* Tutor No-Show */}
                          <button
                            onClick={() => handleTutorNoShow(b.id)}
                            disabled={isActing}
                            title="Mark yourself as no-show"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '11.5px', cursor: isActing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: isActing ? 0.5 : 1 }}
                            onMouseEnter={e => { if (!isActing) e.currentTarget.style.background = '#FECACA'; }}
                            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                          >
                            {isActing === b.id ? <Loader2 size={10} style={{ animation: 'spin 0.8s linear infinite' }} /> : <>⚠️</>}
                            Tutor No-Show
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#c4d4e8', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f4fa', color: '#94a3b8', fontSize: '12px' }}>
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,10,35,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setRejectModal(null)}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 28px 60px rgba(0,47,108,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '17px', marginBottom: '2px' }}>Reject Booking</h3>
                <p style={{ color: '#5a7bad', fontSize: '13px' }}>Optionally provide a reason for the student.</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)…"
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '18px' }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '11px', borderRadius: '11px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleRejectSubmit} disabled={acting !== null}
                style={{ flex: 1, padding: '11px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#B91C1C)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {acting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <XCircle size={15} />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}