import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { api } from '../../services/apiService';
import {
  GraduationCap, Check, X, RefreshCw, Clock, ShieldCheck, ShieldX, Loader2, Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface TutorRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  expertise?: string;
  subjects?: string;
  verificationStatus: string;
  profilePhotoUrl?: string;
}

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:        { bg: '#FFFBEB', text: '#D97706', label: 'Pending'  },
  APPROVED:       { bg: '#ECFDF5', text: '#059669', label: 'Approved' },
  REJECTED:       { bg: '#FEF2F2', text: '#DC2626', label: 'Rejected' },
  NOT_APPLICABLE: { bg: '#F3F4F6', text: '#6B7280', label: 'N/A'      },
};

export function AdminTutorVerification() {
  const [tutors,   setTutors]   = useState<TutorRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [acting,   setActing]   = useState<number | null>(null);

  const [rejectModal,  setRejectModal]  = useState<{ id: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const data = await api.get<TutorRow[]>('/api/admin/tutors');
      setTutors(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTutors(); }, []);

  const handleApprove = async (id: number) => {
    setActing(id);
    try {
      await api.patch(`/api/admin/tutors/${id}/approve`);
      toast.success('Tutor approved!');
      setTutors(prev => prev.map(t => t.id === id ? { ...t, verificationStatus: 'APPROVED' } : t));
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActing(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    setActing(rejectModal.id);
    try {
      await api.patch(`/api/admin/tutors/${rejectModal.id}/reject`, { reason: rejectReason });
      toast.success('Tutor rejected.');
      setTutors(prev => prev.map(t => t.id === rejectModal.id ? { ...t, verificationStatus: 'REJECTED' } : t));
      setRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActing(null);
    }
  };

  const filtered = tutors.filter(t => {
    const matchSearch = `${t.firstName} ${t.lastName} ${t.email} ${t.expertise || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || t.verificationStatus === filter;
    return matchSearch && matchFilter;
  });

  const counts = { ALL: tutors.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  tutors.forEach(t => { if (t.verificationStatus in counts) (counts as any)[t.verificationStatus]++; });

  return (
    <DashboardLayout role="ADMIN">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Tutor Verification
        </h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>Review and approve or reject tutor registration requests.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'All Tutors',    value: counts.ALL,      color: '#3B82F6', bg: '#EFF6FF',  icon: GraduationCap },
          { label: 'Pending',       value: counts.PENDING,  color: '#D97706', bg: '#FFFBEB',  icon: Clock         },
          { label: 'Approved',      value: counts.APPROVED, color: '#059669', bg: '#ECFDF5',  icon: ShieldCheck   },
          { label: 'Rejected',      value: counts.REJECTED, color: '#DC2626', bg: '#FEF2F2',  icon: ShieldX       },
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
      {counts.PENDING > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1px solid #FCD34D', marginBottom: '18px' }}>
          <Clock size={16} color="#D97706" />
          <span style={{ color: '#92400E', fontWeight: 600, fontSize: '13.5px' }}>
            <strong>{counts.PENDING}</strong> tutor{counts.PENDING > 1 ? 's' : ''} awaiting verification.
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['ALL','PENDING','APPROVED','REJECTED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${filter === f ? '#3B82F6' : '#e0eaff'}`, background: filter === f ? 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' : 'white', color: filter === f ? '#1D4ED8' : '#6B8FC4', fontWeight: filter === f ? 700 : 500, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}>
            {f === 'ALL' ? 'All' : f.charAt(0)+f.slice(1).toLowerCase()} ({(counts as any)[f] ?? 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0eaff', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={15} color="#93C5FD" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tutors…"
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', color: '#001a4d', boxSizing: 'border-box' as const }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = '#e0eaff'}
            />
          </div>
          <button onClick={fetchTutors} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7faff' }}>
                {['Tutor','Email','Expertise','Subjects','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: '#5a7bad', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.7px', borderBottom: '1px solid #e0eaff', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading tutors…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <GraduationCap size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} /><br />No tutors found.
                </td></tr>
              ) : filtered.map((t, i) => {
                const badge  = statusBadge[t.verificationStatus] || statusBadge.NOT_APPLICABLE;
                const isPending = t.verificationStatus === 'PENDING';
                const isActingThis = acting === t.id;
                return (
                  <tr key={t.id}
                    style={{ borderBottom: i < filtered.length-1 ? '1px solid #f0f4fa' : 'none', background: isPending ? 'rgba(251,191,36,0.03)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f7faff')}
                    onMouseLeave={e => (e.currentTarget.style.background = isPending ? 'rgba(251,191,36,0.03)' : 'transparent')}
                  >
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #DBEAFE' }}>
                          {t.profilePhotoUrl ? (
                            <img src={t.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{t.firstName[0]}{t.lastName[0]}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ color: '#001a4d', fontWeight: 600, fontSize: '14px' }}>{t.firstName} {t.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px', color: '#5a7bad', fontSize: '13px' }}>{t.email}</td>
                    <td style={{ padding: '13px 18px', color: '#5a7bad', fontSize: '13px' }}>{t.expertise || <span style={{ color: '#c4d4e8' }}>—</span>}</td>
                    <td style={{ padding: '13px 18px' }}>
                      {t.subjects
                        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {t.subjects.split(',').slice(0,3).map(s => (
                              <span key={s} style={{ padding: '2px 8px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 600 }}>{s.trim()}</span>
                            ))}
                          </div>
                        : <span style={{ color: '#c4d4e8', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 11px', borderRadius: '20px', background: badge.bg, color: badge.text, fontSize: '12px', fontWeight: 700 }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* Approve */}
                          <button
                            onClick={() => handleApprove(t.id)}
                            disabled={isActingThis}
                            title="Approve tutor"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontWeight: 700, fontSize: '12.5px', cursor: isActingThis ? 'not-allowed' : 'pointer', boxShadow: '0 3px 8px rgba(5,150,105,0.3)', transition: 'all 0.15s', opacity: isActingThis ? 0.7 : 1 }}
                            onMouseEnter={e => { if (!isActingThis) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {isActingThis ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} />}
                            Approve
                          </button>
                          {/* Reject */}
                          <button
                            onClick={() => { setRejectModal({ id: t.id, name: `${t.firstName} ${t.lastName}` }); setRejectReason(''); }}
                            disabled={isActingThis}
                            title="Reject tutor"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '9px', border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '12.5px', cursor: isActingThis ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: isActingThis ? 0.7 : 1 }}
                            onMouseEnter={e => { if (!isActingThis) e.currentTarget.style.background = '#FECACA'; }}
                            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                          >
                            <X size={12} /> Reject
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
            Showing {filtered.length} of {tutors.length} tutors
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
                <ShieldX size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '17px', marginBottom: '2px' }}>Reject Tutor Account</h3>
                <p style={{ color: '#5a7bad', fontSize: '13px' }}>{rejectModal.name}</p>
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
                {acting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <X size={15} />}
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