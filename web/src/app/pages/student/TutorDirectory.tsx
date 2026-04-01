import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Search, Star, BookOpen, Users, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';

interface Tutor {
  id: number; firstName: string; lastName: string; email: string;
  bio?: string; expertise?: string; rating?: number; reviewCount?: number;
  subjects?: string[]; location?: string; isVerified?: boolean; profilePhotoUrl?: string;
}
interface CatalogSubject { id: number; name: string; }

export function TutorDirectory() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [tutors,    setTutors]    = useState<Tutor[]>([]);
  const [subjects,  setSubjects]  = useState<CatalogSubject[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterSub, setFilterSub] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Tutor[]>('/api/tutors'),
      api.get<CatalogSubject[]>('/api/catalog/subjects'),
    ]).then(([t, s]) => { setTutors(t); setSubjects(s); })
      .catch(e => toast.error(e.message || 'Failed to load tutors'))
      .finally(() => setLoading(false));
  }, []);

  if (!currentUser) return null;

  const filtered = tutors.filter(t => {
    const matchSearch = `${t.firstName} ${t.lastName} ${t.expertise || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchSub = !filterSub || (t.subjects ?? []).some(s => s.toLowerCase().includes(filterSub.toLowerCase()))
                   || (t.expertise ?? '').toLowerCase().includes(filterSub.toLowerCase());
    return matchSearch && matchSub;
  });

  return (
    <DashboardLayout role="STUDENT">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>Find a Tutor</h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>Browse qualified peer tutors and book a session.</p>
      </div>

      {/* Search + subject filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} color="#93C5FD" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or expertise…"
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1.5px solid #e0eaff', background: 'white', fontSize: '14px', outline: 'none', color: '#001a4d', boxSizing: 'border-box', boxShadow: '0 2px 10px rgba(0,47,108,0.06)' }}
            onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = '0 2px 10px rgba(0,47,108,0.06)'; }}
          />
        </div>
        <div style={{ position: 'relative', minWidth: '200px' }}>
          <BookOpen size={15} color="#93C5FD" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <select value={filterSub} onChange={e => setFilterSub(e.target.value)}
            style={{ width: '100%', padding: '12px 36px 12px 36px', borderRadius: '12px', border: `1.5px solid ${filterSub ? '#3B82F6' : '#e0eaff'}`, background: filterSub ? '#EFF6FF' : 'white', fontSize: '14px', outline: 'none', color: filterSub ? '#1D4ED8' : '#5a7bad', cursor: 'pointer', appearance: 'none', boxShadow: '0 2px 10px rgba(0,47,108,0.06)' }}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          {filterSub && (
            <button onClick={() => setFilterSub('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={14} color="#3B82F6" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {(search || filterSub) && (
        <p style={{ color: '#5a7bad', fontSize: '13px', marginBottom: '16px' }}>
          Showing <strong>{filtered.length}</strong> tutor{filtered.length !== 1 ? 's' : ''}
          {filterSub && <> · Subject: <strong style={{ color: '#2563EB' }}>{filterSub}</strong></>}
          {(search || filterSub) && (
            <button onClick={() => { setSearch(''); setFilterSub(''); }} style={{ marginLeft: '8px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Clear filters</button>
          )}
        </p>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', height: '200px', animation: 'pulse 1.5s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,47,108,0.07)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Users size={56} style={{ color: '#BFDBFE', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>No Tutors Found</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>{search || filterSub ? 'Try different search terms.' : 'No tutors have registered yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {filtered.map(t => (
            <div key={t.id} onClick={() => navigate(`/student/tutor/${t.id}`)}
              style={{ background: 'white', borderRadius: '16px', padding: '22px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,47,108,0.13)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,47,108,0.07)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #DBEAFE' }}>
                  {t.profilePhotoUrl ? <img src={t.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{t.firstName[0]}</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                    {t.firstName} {t.lastName}
                    {t.isVerified && <span style={{ marginLeft: '6px', color: '#2563EB', fontSize: '11px' }}>✓</span>}
                  </div>
                  {t.expertise && <div style={{ color: '#5a7bad', fontSize: '12.5px' }}>{t.expertise}</div>}
                  {!!t.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ color: i < Math.round(t.rating!) ? '#FCD34D' : '#E5E7EB', fill: i < Math.round(t.rating!) ? '#FCD34D' : 'none' }} />)}
                      <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '3px' }}>({t.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>
              {t.bio && <p style={{ color: '#5a7bad', fontSize: '12.5px', lineHeight: 1.5, marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{t.bio}</p>}
              {t.subjects && t.subjects.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {t.subjects.slice(0, 3).map(s => (
                    <span key={s} onClick={e => { e.stopPropagation(); setFilterSub(s.trim()); }}
                      style={{ padding: '2px 9px', borderRadius: '20px', background: filterSub === s.trim() ? '#DBEAFE' : '#EFF6FF', color: '#2563EB', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                      title="Filter by this subject"
                    >{s.trim()}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563EB', fontWeight: 600, fontSize: '13px' }}>View Profile <ArrowRight size={14} /></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}