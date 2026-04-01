import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { api } from '../../services/apiService';
import { BookOpen, MapPin, Plus, Pencil, Trash2, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Subject         { id: number; name: string; isActive: boolean; }
interface TutoringLocation { id: number; name: string; description?: string; isActive: boolean; }

type EditTarget = { type: 'subject' | 'location'; id: number; name: string; description?: string };

export function AdminCatalog() {
  const [subjects,   setSubjects]   = useState<Subject[]>([]);
  const [locations,  setLocations]  = useState<TutoringLocation[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);

  // add forms
  const [newSubject,  setNewSubject]  = useState('');
  const [newLocName,  setNewLocName]  = useState('');
  const [newLocDesc,  setNewLocDesc]  = useState('');

  // inline edit
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        api.get<Subject[]>('/api/catalog/subjects/all'),
        api.get<TutoringLocation[]>('/api/catalog/locations/all'),
      ]);
      setSubjects(s); setLocations(l);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── subjects ─────────────────────────────────────────────────────────
  const addSubject = async () => {
    if (!newSubject.trim()) { toast.error('Subject name is required.'); return; }
    setSaving(true);
    try {
      const s = await api.post<Subject>('/api/catalog/subjects', { name: newSubject.trim() });
      setSubjects(prev => [...prev, s]); setNewSubject('');
      toast.success('Subject added!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const saveSubjectEdit = async () => {
    if (!editing || editing.type !== 'subject') return;
    setSaving(true);
    try {
      const s = await api.put<Subject>(`/api/catalog/subjects/${editing.id}`, { name: editing.name });
      setSubjects(prev => prev.map(x => x.id === s.id ? s : x));
      setEditing(null); toast.success('Subject updated.');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteSubject = async (id: number) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/api/catalog/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s.id !== id)); toast.success('Subject deleted.');
    } catch (e: any) { toast.error(e.message); }
  };

  // ── locations ────────────────────────────────────────────────────────
  const addLocation = async () => {
    if (!newLocName.trim()) { toast.error('Location name is required.'); return; }
    setSaving(true);
    try {
      const l = await api.post<TutoringLocation>('/api/catalog/locations', { name: newLocName.trim(), description: newLocDesc.trim() || undefined });
      setLocations(prev => [...prev, l]); setNewLocName(''); setNewLocDesc('');
      toast.success('Location added!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const saveLocationEdit = async () => {
    if (!editing || editing.type !== 'location') return;
    setSaving(true);
    try {
      const l = await api.put<TutoringLocation>(`/api/catalog/locations/${editing.id}`, { name: editing.name, description: editing.description });
      setLocations(prev => prev.map(x => x.id === l.id ? l : x));
      setEditing(null); toast.success('Location updated.');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deleteLocation = async (id: number) => {
    if (!confirm('Delete this location?')) return;
    try {
      await api.delete(`/api/catalog/locations/${id}`);
      setLocations(prev => prev.filter(l => l.id !== id)); toast.success('Location deleted.');
    } catch (e: any) { toast.error(e.message); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', color: '#001a4d', boxSizing: 'border-box' };

  const Section = ({ title, icon: Icon, color, bg, children }: any) => (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        <h2 style={{ color: '#001a4d', fontWeight: 800, fontSize: '16px' }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, desc, onEdit, onDelete }: { label: string; desc?: string; onEdit: () => void; onDelete: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f0f4fa' }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#001a4d', fontWeight: 600, fontSize: '14px' }}>{label}</div>
        {desc && <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{desc}</div>}
      </div>
      <button onClick={onEdit} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #BFDBFE', background: '#EFF6FF', cursor: 'pointer', display: 'flex' }}><Pencil size={13} color="#2563EB" /></button>
      <button onClick={onDelete} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex' }}><Trash2 size={13} color="#DC2626" /></button>
    </div>
  );

  return (
    <DashboardLayout role="ADMIN">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>Catalog</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Manage subjects and locations used across TutorTime.</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* ── SUBJECTS ── */}
          <Section title="Subjects" icon={BookOpen} color="#3B82F6" bg="#EFF6FF">
            {/* Add form */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics…" style={inp}
                onKeyDown={e => { if (e.key === 'Enter') addSubject(); }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#e0eaff'}
              />
              <button onClick={addSubject} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />} Add
              </button>
            </div>

            {/* List */}
            <div>
              {subjects.length === 0
                ? <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No subjects yet.</p>
                : subjects.map(s =>
                  editing?.type === 'subject' && editing.id === s.id ? (
                    <div key={s.id} style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f0f4fa' }}>
                      <input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)}
                        style={{ ...inp, flex: 1 }}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#e0eaff'}
                      />
                      <button onClick={saveSubjectEdit} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Save</button>
                      <button onClick={() => setEditing(null)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e0eaff', background: 'white', cursor: 'pointer' }}><X size={13} color="#94a3b8" /></button>
                    </div>
                  ) : (
                    <Row key={s.id} label={s.name}
                      onEdit={() => setEditing({ type: 'subject', id: s.id, name: s.name })}
                      onDelete={() => deleteSubject(s.id)}
                    />
                  )
                )}
            </div>
          </Section>

          {/* ── LOCATIONS ── */}
          <Section title="Locations" icon={MapPin} color="#10B981" bg="#ECFDF5">
            {/* Add form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <input value={newLocName} onChange={e => setNewLocName(e.target.value)}
                placeholder="e.g., Room 201, Library…" style={inp}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#e0eaff'}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={newLocDesc} onChange={e => setNewLocDesc(e.target.value)}
                  placeholder="Description (optional)" style={{ ...inp, flex: 1 }}
                  onKeyDown={e => { if (e.key === 'Enter') addLocation(); }}
                  onFocus={e => e.target.style.borderColor = '#3B82F6'}
                  onBlur={e => e.target.style.borderColor = '#e0eaff'}
                />
                <button onClick={addLocation} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />} Add
                </button>
              </div>
            </div>

            {/* List */}
            <div>
              {locations.length === 0
                ? <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No locations yet.</p>
                : locations.map(l =>
                  editing?.type === 'location' && editing.id === l.id ? (
                    <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0', borderBottom: '1px solid #f0f4fa' }}>
                      <input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)}
                        placeholder="Name" style={inp}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#e0eaff'}
                      />
                      <input value={editing.description ?? ''} onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : p)}
                        placeholder="Description" style={inp}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#e0eaff'}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={saveLocationEdit} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Check size={12} /> Save</button>
                        <button onClick={() => setEditing(null)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e0eaff', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={13} color="#94a3b8" /></button>
                      </div>
                    </div>
                  ) : (
                    <Row key={l.id} label={l.name} desc={l.description}
                      onEdit={() => setEditing({ type: 'location', id: l.id, name: l.name, description: l.description })}
                      onDelete={() => deleteLocation(l.id)}
                    />
                  )
                )}
            </div>
          </Section>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
