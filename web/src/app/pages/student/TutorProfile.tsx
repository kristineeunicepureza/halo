import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { ArrowLeft, Star, MapPin, Clock, Calendar, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface TutorData {
  id: number; firstName: string; lastName: string; email: string;
  bio?: string; expertise?: string; rating?: number; reviewCount?: number;
  subjects?: string[]; location?: string; isVerified?: boolean; profilePhotoUrl?: string;
}

interface Slot {
  id: number;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  location?: string;
  subject?: string;
  isBooked: boolean;
}

export function TutorProfile() {
  const { currentUser } = useApp();
  const navigate        = useNavigate();
  const { id }          = useParams<{ id: string }>();

  const [tutor,    setTutor]    = useState<TutorData | null>(null);
  const [slots,    setSlots]    = useState<Slot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [notes,    setNotes]    = useState('');
  const [booking,  setBooking]  = useState(false);

  // subject filter for the slot grid
  const [subjectFilter, setSubjectFilter] = useState('');

  const refreshSlots = async () => {
    const fresh = await api.get<Slot[]>(`/api/availability/tutor/${id}`);
    setSlots(fresh);
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<TutorData>(`/api/tutors/${id}`),
      api.get<Slot[]>(`/api/availability/tutor/${id}`),
    ]).then(([t, s]) => { setTutor(t); setSlots(s); })
      .catch(e => toast.error(e.message || 'Failed to load tutor'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!currentUser) return null;

  // derive unique subjects from available slots
  const slotSubjects = [...new Set(slots.map(s => s.subject).filter(Boolean))] as string[];

  const available = slots.filter(s => {
    if (s.isBooked) return false;
    if (subjectFilter && s.subject !== subjectFilter) return false;
    return true;
  });

  const handleBook = async () => {
    if (!selected) { toast.error('Please select a time slot.'); return; }
    setBooking(true);
    try {
      // Format scheduledTime as "YYYY-MM-DD HH:mm"
      const start    = new Date(selected.startTime);
      const pad      = (n: number) => String(n).padStart(2, '0');
      const dateStr  = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
      const timeStr  = `${pad(start.getHours())}:${pad(start.getMinutes())}`;

      await api.post('/api/bookings', {
        tutorId:             parseInt(id!),
        subject:             selected.subject || tutor?.expertise || 'General Tutoring',
        notes,
        scheduledTime:       `${dateStr} ${timeStr}`,
        availabilitySlotId:  selected.id,
      });

      toast.success('Booking created! The tutor has been notified.');
      setSelected(null);
      setNotes('');
      await refreshSlots();
    } catch (e: any) {
      toast.error(e.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <DashboardLayout role="STUDENT">
      <button
        onClick={() => navigate('/student/tutors')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}
      >
        <ArrowLeft size={15} /> Back to Tutors
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading tutor profile…</div>
      ) : !tutor ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Tutor not found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── Left: tutor info ── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)', position: 'sticky', top: '80px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 14px', border: '3px solid #DBEAFE' }}>
              {tutor.profilePhotoUrl ? (
                <img src={tutor.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '28px' }}>{tutor.firstName[0]}</span>
                </div>
              )}
            </div>
            <h2 style={{ textAlign: 'center', color: '#001a4d', fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>
              {tutor.firstName} {tutor.lastName}
              {tutor.isVerified && <span style={{ display: 'block', fontSize: '11px', color: '#059669', marginTop: '4px' }}>✓ Verified Tutor</span>}
            </h2>
            <p style={{ textAlign: 'center', color: '#5a7bad', fontSize: '13px', marginBottom: '14px' }}>{tutor.email}</p>

            {!!tutor.rating && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} style={{ color: i < Math.round(tutor.rating!) ? '#FCD34D' : '#E5E7EB', fill: i < Math.round(tutor.rating!) ? '#FCD34D' : 'none' }} />
                ))}
                <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '4px' }}>({tutor.reviewCount})</span>
              </div>
            )}

            {tutor.expertise && (
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0eaff' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Expertise</div>
                <div style={{ color: '#1e3a6e', fontSize: '13.5px' }}>{tutor.expertise}</div>
              </div>
            )}

            {tutor.bio && (
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0eaff' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>About</div>
                <div style={{ color: '#5a7bad', fontSize: '13px', lineHeight: 1.6 }}>{tutor.bio}</div>
              </div>
            )}

            {tutor.subjects && tutor.subjects.length > 0 && (
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0eaff' }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Subjects</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {tutor.subjects.map(s => (
                    <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 600 }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {tutor.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5a7bad', fontSize: '13px', marginTop: '4px' }}>
                <MapPin size={14} color="#3B82F6" /> {tutor.location}
              </div>
            )}
          </div>

          {/* ── Right: booking panel ── */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '18px' }}>Available Slots</h3>
              {/* Subject filter pills */}
              {slotSubjects.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setSubjectFilter(''); setSelected(null); }}
                    style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${!subjectFilter ? '#3B82F6' : '#e0eaff'}`, background: !subjectFilter ? '#EFF6FF' : 'white', color: !subjectFilter ? '#1D4ED8' : '#6B8FC4', fontSize: '12px', fontWeight: !subjectFilter ? 700 : 500, cursor: 'pointer' }}
                  >All</button>
                  {slotSubjects.map(sub => (
                    <button
                      key={sub}
                      onClick={() => { setSubjectFilter(sub); setSelected(null); }}
                      style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${subjectFilter === sub ? '#3B82F6' : '#e0eaff'}`, background: subjectFilter === sub ? '#EFF6FF' : 'white', color: subjectFilter === sub ? '#1D4ED8' : '#6B8FC4', fontSize: '12px', fontWeight: subjectFilter === sub ? 700 : 500, cursor: 'pointer' }}
                    >{sub}</button>
                  ))}
                </div>
              )}
            </div>

            {available.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                <p>{subjectFilter ? `No available slots for "${subjectFilter}".` : 'No available slots at the moment.'}</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '10px', marginBottom: '20px' }}>
                  {available.map(slot => {
                    const isActive = selected?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelected(s => s?.id === slot.id ? null : slot)}
                        style={{
                          padding: '14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          border: `1.5px solid ${isActive ? '#3B82F6' : '#e0eaff'}`,
                          background: isActive ? 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' : 'white',
                          boxShadow: isActive ? '0 4px 14px rgba(37,99,235,0.15)' : 'none',
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.background = '#f7faff'; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#e0eaff'; e.currentTarget.style.background = 'white'; } }}
                      >
                        {/* Subject */}
                        {slot.subject && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: isActive ? 'rgba(37,99,235,0.12)' : '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700 }}>{slot.subject}</span>
                          </div>
                        )}
                        {/* Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#001a4d', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                          <Calendar size={13} color="#3B82F6" />
                          {new Date(slot.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {/* Time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5a7bad', fontSize: '12.5px', marginBottom: '4px' }}>
                          <Clock size={12} color="#93C5FD" />
                          {new Date(slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {/* Location */}
                        {slot.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '11.5px' }}>
                            <MapPin size={11} /> {slot.location}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Booking summary & confirm */}
                {selected && (
                  <div style={{ borderTop: '1px solid #e0eaff', paddingTop: '20px' }}>
                    {/* Summary card */}
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg,#f0f6ff,#e8f0fe)', border: '1px solid #BFDBFE', marginBottom: '16px' }}>
                      <p style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>📋 Booking Summary</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong style={{ color: '#1e3a6e' }}>Tutor:</strong> {tutor.firstName} {tutor.lastName}</p>
                        {selected.subject && (
                          <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong style={{ color: '#1e3a6e' }}>Subject:</strong> {selected.subject}</p>
                        )}
                        <p style={{ color: '#5a7bad', fontSize: '13px' }}>
                          <strong style={{ color: '#1e3a6e' }}>Date:</strong>{' '}
                          {new Date(selected.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p style={{ color: '#5a7bad', fontSize: '13px' }}>
                          <strong style={{ color: '#1e3a6e' }}>Time:</strong>{' '}
                          {new Date(selected.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(selected.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {selected.location && (
                          <p style={{ color: '#5a7bad', fontSize: '13px' }}><strong style={{ color: '#1e3a6e' }}>Location:</strong> {selected.location}</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '7px' }}>
                      Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Topics you'd like to focus on, questions you have…"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '14px' }}
                      onFocus={e => e.target.style.borderColor = '#3B82F6'}
                      onBlur={e => e.target.style.borderColor = '#e0eaff'}
                    />

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => { setSelected(null); setNotes(''); }}
                        style={{ padding: '12px 20px', borderRadius: '12px', border: '1.5px solid #e0eaff', background: 'white', color: '#5a7bad', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleBook}
                        disabled={booking}
                        style={{ flex: 1, padding: '13px', borderRadius: '12px', border: 'none', background: booking ? 'linear-gradient(135deg,#93C5FD,#60A5FA)' : 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '15px', cursor: booking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
                        onMouseEnter={e => { if (!booking) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {booking
                          ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Booking…</>
                          : <><CheckCircle size={16} /> Confirm Booking</>}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}