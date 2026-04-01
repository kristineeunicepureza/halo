import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Calendar, MapPin, Clock, Trash2, Plus, RefreshCw, Loader2, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Slot     { id: number; startTime: string; endTime: string; location: string; subject: string; isBooked: boolean; }
interface CatalogItem { id: number; name: string; description?: string; }

function pad(n: number) { return String(n).padStart(2, '0'); }
function toInputValue(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function todayStr()  { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function isInPast(v: string) { return v ? new Date(v) < new Date() : false; }
function isBeforeToday(v: string) { return v ? v.slice(0,10) < todayStr() : false; }

export function TutorAvailability() {
  const { currentUser } = useApp();
  const [slots,     setSlots]     = useState<Slot[]>([]);
  const [subjects,  setSubjects]  = useState<CatalogItem[]>([]);
  const [locations, setLocations] = useState<CatalogItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [form, setForm] = useState({ startTime: '', endTime: '', subject: '', location: '' });
  const [errs, setErrs] = useState({ startTime: '', endTime: '', subject: '', location: '' });

  const fetchSlots = async () => {
    setLoading(true);
    try { setSlots(await api.get<Slot[]>('/api/availability/my-slots')); }
    catch (e: any) { toast.error(e.message || 'Failed to load slots'); }
    finally { setLoading(false); }
  };

  const fetchCatalog = async () => {
    try {
      const [s, l] = await Promise.all([
        api.get<CatalogItem[]>('/api/catalog/subjects'),
        api.get<CatalogItem[]>('/api/catalog/locations'),
      ]);
      setSubjects(s); setLocations(l);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchSlots(); fetchCatalog(); }, []);

  const validate = (name: string, value: string, cur = form) => {
    if (name === 'startTime') {
      if (!value) return 'Start time is required.';
      if (isBeforeToday(value)) return 'Cannot select a past date.';
      if (isInPast(value)) return 'Start time is already in the past.';
    }
    if (name === 'endTime') {
      if (!value) return 'End time is required.';
      if ((cur.startTime || form.startTime) && value <= (cur.startTime || form.startTime)) return 'End time must be after start time.';
    }
    if (name === 'subject'  && !value) return 'Please select a subject.';
    if (name === 'location' && !value) return 'Please select a location.';
    return '';
  };

  const handleChange = (name: string, value: string) => {
    const updated = { ...form, [name]: value };
    setForm(updated);
    const e = validate(name, value, updated);
    let endE = errs.endTime;
    if (name === 'startTime' && updated.endTime)
      endE = updated.endTime <= value ? 'End time must be after start time.' : '';
    setErrs(prev => ({ ...prev, [name]: e, ...(name === 'startTime' ? { endTime: endE } : {}) }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrs = {
      startTime: validate('startTime', form.startTime),
      endTime:   validate('endTime',   form.endTime),
      subject:   validate('subject',   form.subject),
      location:  validate('location',  form.location),
    };
    setErrs(newErrs);
    if (Object.values(newErrs).some(Boolean)) return;

    setSaving(true);
    try {
      const added = await api.post<Slot[]>('/api/availability', {
        startTime: form.startTime.replace('T', ' '),
        endTime:   form.endTime.replace('T', ' '),
        subject:   form.subject,
        location:  form.location,
      });
      setSlots(prev => [...prev, ...(Array.isArray(added) ? added : [added])]);
      const count = Array.isArray(added) ? added.length : 1;
      toast.success(`${count} slot${count > 1 ? 's' : ''} added!`);
      setForm({ startTime: '', endTime: '', subject: '', location: '' });
      setErrs({ startTime: '', endTime: '', subject: '', location: '' });
      setShowForm(false);
    } catch (e: any) { toast.error(e.message || 'Failed to add slot'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slot?')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/availability/${id}`);
      setSlots(prev => prev.filter(s => s.id !== id));
      toast.success('Slot deleted.');
    } catch (e: any) { toast.error(e.message || 'Failed to delete slot'); }
    finally { setDeleting(null); }
  };

  if (!currentUser || currentUser.role !== 'TUTOR') return null;

  const minDateTime = toInputValue(new Date());
  const inp = (hasErr: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 13px', borderRadius: '10px', boxSizing: 'border-box',
    border: `1.5px solid ${hasErr ? '#FCA5A5' : '#e0eaff'}`,
    background: hasErr ? '#FFF5F5' : '#f7faff', color: '#001a4d', fontSize: '13.5px', outline: 'none',
  });
  const sel = (hasErr: boolean): React.CSSProperties => ({
    ...inp(hasErr), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%2393C5FD' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px',
  });

  const slotPreview = (() => {
    if (!form.startTime || !form.endTime || errs.startTime || errs.endTime) return 0;
    return Math.floor((new Date(form.endTime).getTime() - new Date(form.startTime).getTime()) / (1000 * 60 * 30));
  })();

  const ErrorMsg = ({ msg }: { msg: string }) => msg ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
      <AlertCircle size={12} color="#DC2626" />
      <span style={{ color: '#DC2626', fontSize: '11.5px' }}>{msg}</span>
    </div>
  ) : null;

  return (
    <DashboardLayout role="TUTOR">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>Manage Availability</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Set your tutoring slots for students to book.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchSlots} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setShowForm(v => !v); setErrs({ startTime: '', endTime: '', subject: '', location: '' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.32)' }}>
            <Plus size={16} /> Add Slot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[{ label: 'Total', value: slots.length, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Available', value: slots.filter(s => !s.isBooked).length, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Booked', value: slots.filter(s => s.isBooked).length, color: '#EF4444', bg: '#FEF2F2' }]
          .map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 14px rgba(0,47,108,0.06)', border: '1px solid rgba(59,130,246,0.08)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color={color} />
            </div>
            <div><div style={{ color: '#001a4d', fontWeight: 800, fontSize: '22px', lineHeight: 1 }}>{value}</div><div style={{ color: '#6B8FC4', fontSize: '12px', marginTop: '2px' }}>{label}</div></div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,47,108,0.09)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>New Availability Window</h3>
          <p style={{ color: '#5a7bad', fontSize: '13px', marginBottom: '16px' }}>Creates 30-minute slots within the selected window.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FCD34D', marginBottom: '18px' }}>
            <AlertCircle size={14} color="#D97706" />
            <span style={{ color: '#92400E', fontSize: '13px' }}>Only <strong>today or future dates</strong> are allowed.</span>
          </div>

          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '5px' }}>Subject <span style={{ color: '#EF4444' }}>*</span></label>
                <select value={form.subject} onChange={e => handleChange('subject', e.target.value)} style={sel(!!errs.subject)}>
                  <option value="">— Select subject —</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <ErrorMsg msg={errs.subject} />
              </div>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '5px' }}>Location <span style={{ color: '#EF4444' }}>*</span></label>
                <select value={form.location} onChange={e => handleChange('location', e.target.value)} style={sel(!!errs.location)}>
                  <option value="">— Select location —</option>
                  {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
                <ErrorMsg msg={errs.location} />
              </div>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '5px' }}>Start Time <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="datetime-local" value={form.startTime} min={minDateTime} onChange={e => handleChange('startTime', e.target.value)} style={inp(!!errs.startTime)} onFocus={e => { if (!errs.startTime) e.target.style.borderColor = '#3B82F6'; }} onBlur={e => { if (!errs.startTime) e.target.style.borderColor = '#e0eaff'; }} />
                <ErrorMsg msg={errs.startTime} />
              </div>
              <div>
                <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '5px' }}>End Time <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="datetime-local" value={form.endTime} min={form.startTime || minDateTime} onChange={e => handleChange('endTime', e.target.value)} style={inp(!!errs.endTime)} onFocus={e => { if (!errs.endTime) e.target.style.borderColor = '#3B82F6'; }} onBlur={e => { if (!errs.endTime) e.target.style.borderColor = '#e0eaff'; }} />
                <ErrorMsg msg={errs.endTime} />
              </div>
            </div>

            {slotPreview > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #6EE7B7', marginBottom: '16px' }}>
                <CheckCircle2 size={14} color="#059669" />
                <span style={{ color: '#065F46', fontSize: '13px', fontWeight: 500 }}>Will create <strong>{slotPreview} slot{slotPreview > 1 ? 's' : ''}</strong> of 30 minutes · Subject: <strong>{form.subject}</strong> · Location: <strong>{form.location}</strong></span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '13.5px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 12px rgba(37,99,235,0.28)' }}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={14} />} {saving ? 'Saving…' : 'Save Slots'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm({ startTime: '', endTime: '', subject: '', location: '' }); setErrs({ startTime: '', endTime: '', subject: '', location: '' }); }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #BFDBFE', background: 'white', color: '#1E40AF', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Slots list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading slots…</div>
      ) : slots.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,47,108,0.07)' }}>
          <Calendar size={48} style={{ color: '#BFDBFE', margin: '0 auto 14px', display: 'block' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>No Slots Yet</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Add your first availability slot to start accepting bookings.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {slots.map(slot => {
            const start  = new Date(slot.startTime);
            const end    = new Date(slot.endTime);
            const isPast = start < new Date();
            return (
              <div key={slot.id} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,47,108,0.06)', border: `1px solid ${slot.isBooked ? 'rgba(239,68,68,0.18)' : 'rgba(59,130,246,0.1)'}`, opacity: isPast && !slot.isBooked ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: slot.isBooked ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={19} color={slot.isBooked ? '#EF4444' : '#3B82F6'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px' }}>
                        {start.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: slot.isBooked ? '#FEF2F2' : isPast ? '#F3F4F6' : '#ECFDF5', color: slot.isBooked ? '#DC2626' : isPast ? '#6B7280' : '#059669' }}>
                        {slot.isBooked ? 'Booked' : isPast ? 'Expired' : 'Available'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5a7bad', fontSize: '12.5px' }}><Clock size={12} color="#93C5FD" /> {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      {slot.subject  && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5a7bad', fontSize: '12.5px' }}><BookOpen size={12} color="#93C5FD" /> {slot.subject}</div>}
                      {slot.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5a7bad', fontSize: '12.5px' }}><MapPin size={12} color="#93C5FD" /> {slot.location}</div>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(slot.id)} disabled={!!deleting || slot.isBooked} title={slot.isBooked ? 'Cannot delete a booked slot' : 'Delete'}
                  style={{ padding: '9px', borderRadius: '9px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: (deleting || slot.isBooked) ? 'not-allowed' : 'pointer', opacity: slot.isBooked ? 0.4 : 1, flexShrink: 0 }}
                  onMouseEnter={e => { if (!slot.isBooked && !deleting) e.currentTarget.style.background = '#FECACA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}>
                  {deleting === slot.id ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}