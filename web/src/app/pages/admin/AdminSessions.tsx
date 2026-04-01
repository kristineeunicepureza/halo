import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Calendar, Search, RefreshCw, CheckCircle2, Clock, XCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

interface BookingRow {
  id: number;
  studentName: string;
  tutorName: string;
  subject: string;
  notes: string;
  status: string;
  scheduledTime: string;
  createdAt: string;
}

const statusColor: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  PENDING:   { bg: '#FFFBEB', text: '#D97706', icon: Clock      },
  CONFIRMED: { bg: '#EFF6FF', text: '#2563EB', icon: CheckCircle2 },
  COMPLETED: { bg: '#ECFDF5', text: '#059669', icon: Star        },
  CANCELLED: { bg: '#FEF2F2', text: '#DC2626', icon: XCircle     },
};

export function AdminSessions() {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get<BookingRow[]>('/api/bookings/all');
      setBookings(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  if (!currentUser) return null;

  const filtered = bookings.filter(b => {
    const matchSearch = `${b.studentName} ${b.tutorName} ${b.subject}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || b.status === filter;
    return matchSearch && matchFilter;
  });

  const counts: Record<string, number> = { ALL: bookings.length };
  bookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });

  return (
    <DashboardLayout role="ADMIN">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          All Sessions
        </h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>Overview of all tutoring bookings on the platform.</p>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${filter === s ? '#3B82F6' : '#e0eaff'}`, background: filter === s ? 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' : 'white', color: filter === s ? '#1D4ED8' : '#6B8FC4', fontWeight: filter === s ? 700 : 500, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}>
            {s === 'ALL' ? 'All' : s.charAt(0)+s.slice(1).toLowerCase()} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0eaff', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={15} color="#93C5FD" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, tutor or subject…"
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', color: '#001a4d', boxSizing: 'border-box' as const }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; }} onBlur={e => { e.target.style.borderColor = '#e0eaff'; }}
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
                {['Student','Tutor','Subject','Scheduled','Status'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: '#5a7bad', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.7px', borderBottom: '1px solid #e0eaff', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading sessions…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <Calendar size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} /><br />No sessions found.
                </td></tr>
              ) : filtered.map((b, i) => {
                const st = statusColor[b.status] || statusColor.PENDING;
                const Icon = st.icon;
                return (
                  <tr key={b.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f0f4fa' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f7faff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 18px', color: '#001a4d', fontWeight: 600, fontSize: '13.5px' }}>{b.studentName}</td>
                    <td style={{ padding: '13px 18px', color: '#1e3a6e', fontSize: '13.5px' }}>{b.tutorName}</td>
                    <td style={{ padding: '13px 18px', color: '#5a7bad', fontSize: '13px' }}>{b.subject}</td>
                    <td style={{ padding: '13px 18px', color: '#5a7bad', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                      {new Date(b.scheduledTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 11px', borderRadius: '20px', background: st.bg, color: st.text, fontSize: '12px', fontWeight: 700 }}>
                        <Icon size={12} /> {b.status.charAt(0)+b.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f4fa', color: '#94a3b8', fontSize: '12px' }}>
            Showing {filtered.length} of {bookings.length} sessions
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}